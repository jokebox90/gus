import json
import logging
import os
import shlex
import shutil
import subprocess
import uuid
from collections import OrderedDict
from datetime import datetime

import bcrypt
from beaker.cache import cache_region, region_invalidate
from minio import InvalidResponseError as MinioInvalidResponseError
from minio.deleteobjects import DeleteObject
from minio.error import S3Error
from pyramid.response import Response
from pyramid.view import view_config
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from stringcase import alphanumcase, spinalcase

from .. import models


@view_config(route_name="collection_options")
@view_config(route_name="resource_options")
def cors_preflight_catchall(request):
    """
    Renvoie les en-têtes nécessaires pour contrôler
    l'origine des requêtes faites sur l'API (CORS).
    """
    return Response(status=204)


def resolve_s3object(unique_id, list_items):
    """
    Permet de sélectionner le premier élément
    de la liste des objets s3 correspondant
    au paramètre 'unique_id'
    """
    for item in list_items:
        if item["unique_id"] == unique_id:
            return item


def make_bucket(client, bucket):
    """
    Procédure de création d'un bucket S3 et
    définition des règles d'accès aux fichiers.
    """
    logging.info("MinIO: Creating new bucket: %s" % bucket)

    # Anonymous read-only policy
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": "*"},
                "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                "Resource": "arn:aws:s3:::%s" % bucket,
            },
            {
                "Effect": "Allow",
                "Principal": {"AWS": "*"},
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::%s/*" % bucket,
            },
        ],
    }

    client.make_bucket(bucket)
    client.set_bucket_policy(bucket, json.dumps(policy))
    command = "mc admin bucket quota gus/%s --hard 5g" % bucket
    subprocess.Popen(shlex.split(command), start_new_session=True)


def fetch_s3objects(client, bucket):
    """
    Récupère l'information sur les objets s3
    depuis le serveur MinIO. Conserve en mémoire
    les résultats pour limiter la sollicitation
    intensive du serveur de stockage.
    """

    @cache_region("long_term", bucket)
    def _fetch():
        try:
            return list(client.list_objects(bucket, recursive=False))
        except S3Error as exc:
            if exc.code == "NoSuchBucket":
                make_bucket(client, bucket)
            return []

    cached = getattr(fetch_s3objects, "__cached__", None)
    if not cached:
        setattr(fetch_s3objects, "__cached__", _fetch)

    return [
        OrderedDict(
            {
                "unique_id": item.object_name,
                "size": item.size,
                "bucket": bucket,
            }
        )
        for item in _fetch()
    ]


@view_config(route_name="index", renderer="json")
def index_view(request):
    client = request.minio_client
    session = request.session
    try:
        username = session["user"]
    except KeyError:
        error_response = Response()
        error_response.status_code = 403
        error_response.json = {"error_message": "Forbidden."}
        return error_response

    s3bucket = spinalcase(alphanumcase(username))
    if "CACHE_PURGE" in request.GET and int(request.GET["CACHE_PURGE"]) == 1:
        region_invalidate(fetch_s3objects.__cached__, None, s3bucket)

    s3objects = fetch_s3objects(client, s3bucket)
    s3keys = [item["unique_id"] for item in s3objects]

    try:
        query = request.dbsession.query(models.FileModel)
        s3metadata = query.filter(models.FileModel.unique_id.in_(s3keys)).all()
    except SQLAlchemyError:
        return Response("Database error", content_type="text/plain", status=500)  # noqa

    for meta in s3metadata:
        s3object = resolve_s3object(meta.unique_id, s3objects)
        s3object["title"] = meta.title
        s3object["description"] = meta.description
        s3object["unique_id"] = meta.unique_id
        s3object["url"] = meta.url
        s3object["name"] = meta.name
        s3object["created_at"] = meta.created_at
        s3object["modified_at"] = meta.modified_at

    return {"s3objects": s3objects}


def deserialize_request_post(request):
    data = {}
    for key in request.POST:
        value = request.POST[key]
        if key.endswith(".1"):
            key = key.rstrip(".1")
            data.setdefault(key, {})["title"] = value
            continue

        if key.endswith(".2"):
            key = key.rstrip(".2")
            data.setdefault(key, {})["description"] = value
            continue

        data.setdefault(key, {})["file"] = value

    return data


@view_config(route_name="create", renderer="json")
def create_view(request):
    client = request.minio_client
    session = request.session
    minio_server_url = request.registry.settings["minio.server_url"]

    try:
        username = session["user"]
    except KeyError:
        error_response = Response()
        error_response.status_code = 403
        error_response.json = {"error_message": "Forbidden."}
        return error_response

    try:
        s3bucket = spinalcase(alphanumcase(username))
        for file_name, value in deserialize_request_post(request).items():
            file_sent = value.get("file")
            file_title = value.get("title")
            file_description = value.get("description")
            file_unique_id = uuid.uuid4().hex
            file_url = "%s/%s/%s" % (minio_server_url, s3bucket, file_unique_id)  # noqa
            timestamp = round(datetime.now().timestamp())
            temp_file_path = "/tmp/%s~" % file_unique_id

            file_sent.file.seek(0)
            with open(temp_file_path, "wb") as temp_file:
                shutil.copyfileobj(file_sent.file, temp_file)

            file_stats = os.stat(temp_file_path)
            with open(temp_file_path, "rb") as target_file:
                client.put_object(
                    s3bucket,
                    file_unique_id,
                    target_file,
                    file_stats.st_size,
                    content_type=file_sent.type,
                    metadata={
                        "UniqueID": file_unique_id,
                        "Owner": s3bucket,
                        "Name": file_name,
                        "Title": file_title,
                        "Description": file_description,
                    },
                )

                request.dbsession.add(
                    models.FileModel(
                        name=file_name,
                        title=file_title,
                        description=file_description,
                        unique_id=file_unique_id,
                        url=file_url,
                        owner=username,
                        file_type=file_sent.type,
                        created_at=timestamp,
                        modified_at=timestamp,
                    )
                )

                region_invalidate(fetch_s3objects.__cached__, None, s3bucket)  # noqa
    except MinioInvalidResponseError:
        error_response = Response()
        error_response.status_code = 500
        error_response.json = {"error_message": "Minio error"}
        return error_response

    response = Response()
    response.json = {"message": "S3 object created."}
    response.status = 201
    return response


@view_config(route_name="update", renderer="json")
def update_view(request):
    request_filename = request.matchdict["filename"]
    json_data = request.json.copy()
    timestamp = datetime.now().timestamp()
    session = request.session
    try:
        username = session["user"]
    except KeyError:
        error_response = Response()
        error_response.status_code = 403
        error_response.json = {"error_message": "Forbidden."}
        return error_response

    try:
        query = request.dbsession.query(models.FileModel)
        s3metadata = query.filter_by(
            unique_id=request_filename,
            owner=username
        ).one_or_none()  # noqa
    except SQLAlchemyError:
        error_response = Response()
        error_response.status_code = 500
        error_response.json = {"error_message": "Database error"}
        return error_response

    if not s3metadata:
        s3metadata = models.FileModel()
        s3metadata.unique_id = uuid.uuid4().hex
        s3metadata.name = json_data["name"]
        s3metadata.title = json_data["title"]
        s3metadata.description = json_data["description"]
        request.dbsession.add(s3metadata)
    else:
        s3metadata.title = json_data["title"]
        s3metadata.description = json_data["description"]
        s3metadata.unique_id = json_data["unique_id"]
        s3metadata.modified_at = timestamp

    s3bucket = spinalcase(alphanumcase(username))
    region_invalidate(fetch_s3objects.__cached__, None, s3bucket)

    response = Response()
    response.json = {"message": "Metadata changed."}
    return response


@view_config(route_name="delete", renderer="json")
def delete_view(request):
    session = request.session

    try:
        username = session["user"]
    except KeyError:
        error_response = Response()
        error_response.status_code = 403
        error_response.json = {"error_message": "Forbidden."}
        return error_response

    json_data = request.json.copy()

    s3bucket = spinalcase(alphanumcase(username))
    errors = list(
        request.minio_client.remove_objects(
            s3bucket, [DeleteObject(name) for name in json_data]
        )
    )

    if len(errors) > 0:
        logging.debug("error occured when deleting object", errors)
        response = Response(status=500)
        response.json = {
            "message": "error occured when deleting object",
            "errors": json.dumps(errors),
        }
        return response

    query = request.dbsession.query(models.FileModel)
    operator = models.FileModel.unique_id.in_(json_data)
    s3objects = query.filter(operator).all()
    if not s3objects:
        response = Response()
        response.json = {"message": "S3 object not found."}
        response.status = 201
        return response

    [request.dbsession.delete(obj) for obj in s3objects]

    region_invalidate(fetch_s3objects.__cached__, None, s3bucket)

    response = Response()
    response.json = {"message": "S3 object deleted."}
    response.status = 201
    return response


@view_config(route_name="register", renderer="json")
def register_view(request):
    json_data = request.json.copy()
    username = json_data["username"]
    email = json_data["email"]
    password = json_data["password"]

    query = request.dbsession.query(models.UserModel)
    count = query.filter(
        or_(
            models.UserModel.username == json_data["username"],
            models.UserModel.email == json_data["email"],
        )
    ).count()

    if count == 0:
        encrypted = bcrypt.hashpw(password.encode("ASCII"), bcrypt.gensalt())
        timestamp = round(datetime.now().timestamp())

        request.dbsession.add(
            models.UserModel(
                username=username,
                password=encrypted,
                email=email,
                created_at=timestamp,
                modified_at=timestamp,
            )
        )

        session = request.session
        session["logged-in"] = True

        response = Response()
        response.status = 201
        response.json = {"message": "Account created successfully."}
        return response

    response = Response()
    response.status = 400
    response.json = {"message": "Invalid username or password."}
    return response


@view_config(route_name="login", renderer="json")
def login_view(request):
    json_data = request.json.copy()
    username = json_data["username"]
    password = json_data["password"]

    query = request.dbsession.query(models.UserModel)
    user = query.filter(
        or_(
            models.UserModel.username == username,
            models.UserModel.email == username
        )
    ).one_or_none()

    if user and user.validate_password(password):
        session = request.session
        session["logged-in"] = True
        session["user"] = user.username
        response = Response()
        response.status = 200
        response.json = {"message": "User authenticated successfully."}
        return response

    response = Response()
    response.status = 400
    response.json = {"message": "Invalid username or password."}
    return response
