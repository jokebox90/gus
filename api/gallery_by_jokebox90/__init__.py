import os

import debugpy  # noqa
import logging
from minio import Minio
from pyramid.config import Configurator
from pyramid.events import NewRequest
from pyramid_beaker import (session_factory_from_settings,
                            set_cache_regions_from_settings)


def setup_minio(config):
    """
    Configure la connexion au serveur de stockage
    de fichiers objets MinIO S3 (compatible AWS).
    """
    settings = config.get_settings()

    def _minio(request):
        return Minio(
            settings["minio.endpoint"],
            access_key=settings["minio.access_key"],
            secret_key=settings["minio.secret_key"],
            secure=settings["minio.disable_tls"] == 0,
        )

    config.add_request_method(_minio, "minio_client", reify=True)


def setup_request(config):
    """
    Configure l'application pour filtrer les
    requêtes provenant des sources définies.
    """
    settings = config.get_settings()
    scheme = settings["scheme"]
    domain = settings["domain"]
    http_origin = "%s://%s" % (scheme, domain)

    def add_cors_headers_response_callback(event):
        def cors_headers(request, response):
            logging.debug("Adding CORS permission to request: {}".format(
                request.url
            ))
            response.headers.update(
                {
                    "Access-Control-Allow-Origin": http_origin,
                    "Access-Control-Allow-Methods": "HEAD,POST,GET,PUT,PATCH,DELETE,OPTIONS",  # noqa
                    "Access-Control-Allow-Headers": "Origin, Content-Type, Accept, Authorization",  # noqa
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "1728000",
                }
            )

        event.request.add_response_callback(cors_headers)

    config.add_subscriber(add_cors_headers_response_callback, NewRequest)


def setup_jinja2(config):
    """
    Ajoute des extensions de fichiers à
    prendre en compte comme des templates.
    """
    config.include("pyramid_jinja2")
    config.add_jinja2_renderer(".j2", settings_prefix="jinja2.")


def setup_session(config):
    """
    Configure les sessions côté serveur en
    s'appuyant sur la bibliothèque Beaker
    et les performances de Redis.
    """
    config.include("pyramid_beaker")
    settings = config.get_settings()
    session_factory = session_factory_from_settings(settings)
    config.set_session_factory(session_factory)
    set_cache_regions_from_settings(settings)


def pull_envvars(config):
    """
    Collecte les variables d'environnement et
    les mets à disposition dans l'application.
    """
    settings = config.get_settings()
    env = os.environ.copy()

    options = {}
    options["scheme"] = env.get("SCHEME")
    options["domain"] = env.get("DOMAIN")
    options["endpoint"] = env.get("ENDPOINT")
    options["sqlalchemy.url"] = env.get("DATABASE_URL")
    options["session.url"] = env.get("SESSION_URL")
    options["session.key"] = env.get("SESSION_KEY")
    options["session.secret"] = env.get("SESSION_SECRET")
    options["cache.url"] = env.get("CACHE_URL")
    options["minio.server_url"] = env.get("MINIO_SERVER_URL")
    options["minio.endpoint"] = env.get("MINIO_ENDPOINT")
    options["minio.access_key"] = env.get("MINIO_ACCESS_KEY")
    options["minio.secret_key"] = env.get("MINIO_SECRET_KEY")
    options["minio.disable_tls"] = env.get("MINIO_DISABLE_TLS")

    settings.update(options)


def main(global_config, **settings):
    """
    Programme principal

    Retourne une application web (WSGI) et tous
    ses services pleinement configurés.
    """

    with Configurator(settings=settings) as config:
        config.include(pull_envvars)
        config.include(setup_session)
        config.include(setup_minio)
        config.include(setup_request)
        config.include(setup_jinja2)
        config.include(".routes")
        config.include(".models")
        config.scan()

        debugpy.listen(("0.0.0.0", 5678))

    return config.make_wsgi_app()
