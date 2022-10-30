import mimetypes
import os
import arrow
from collections import OrderedDict
from wsgiref.simple_server import make_server
from minio import Minio
from pyramid.config import Configurator
from pyramid.response import Response


here = os.path.abspath(os.path.realpath(os.path.dirname(__file__)))


def hello_world(request):
    return {"greeter": "Hello World!"}


def get_list(request):
    bucket_name = request.minio_config['minio_bucket_name']
    bucket_objects = request.minio_client.list_objects(
        bucket_name, recursive=False
    )

    data = {}
    for item in bucket_objects:
        last_modified = arrow.get(item.last_modified)
        last_modified = last_modified.format('YYYY-MM-DD HH:mm:ss ZZ')
        object_data = OrderedDict({
            "name": item.object_name,
            "last_modified": last_modified,
            "etag": item.etag,
            "size": item.size,
            "content_type": mimetypes.guess_type(item.object_name)[0],
            "bucket": bucket_name,
        })
        data.setdefault('objects', []).append(object_data)

    return data


def send_file(request):
    return Response('Hello World!')


def delete_file(request):
    return Response('Hello World!')


def setup_request(config):
    env = dict(os.environ)
    minio_endpoint = env.get('MINIO_ENDPOINT')
    minio_access_key = env.get('MINIO_ACCESS_KEY')
    minio_secret_key = env.get('MINIO_SECRET_KEY')
    minio_bucket_name = env.get('MINIO_BUCKET_NAME', 0)
    minio_disable_tls = env.get('MINIO_DISABLE_TLS', 0)

    def _minio(request):
        return Minio(
            minio_endpoint,
            access_key=minio_access_key,
            secret_key=minio_secret_key,
            secure=minio_disable_tls == 0
        )

    def _minio_config(request):
        return {
            "minio_endpoint": minio_endpoint,
            "minio_access_key": minio_access_key,
            "minio_secret_key": minio_secret_key,
            "minio_bucket_name": minio_bucket_name,
            "minio_disable_tls": minio_disable_tls,
        }

    config.add_request_method(_minio_config, "minio_config", reify=True)
    config.add_request_method(_minio, "minio_client", reify=True)


def setup_routes(config):
    config.add_route('hello', '/')
    config.add_route('get_list', '/uploads', request_method='GET')
    config.add_route('send_file', '/uploads', request_method='PUT')
    config.add_route('delete_file', '/uploads', request_method='DELETE')


def setup_views(config):
    config.include("pyramid_jinja2")
    config.add_jinja2_search_path(os.path.join(here, 'templates'))
    config.add_jinja2_renderer('.j2', settings_prefix='jinja2.')
    config.add_view(
        hello_world, route_name='hello', renderer='templates/index.html.j2'
    )
    config.add_view(get_list, route_name='get_list', renderer='json')
    config.add_view(send_file, route_name='send_file', renderer='json')
    config.add_view(delete_file, route_name='delete_file', renderer='json')
    config.add_static_view(name='static', path='webapp:assets/')


def create_app():
    config = Configurator()
    setup_request(config)
    setup_routes(config)
    setup_views(config)
    return config.make_wsgi_app()


def main():
    app = create_app()
    server = make_server('0.0.0.0', 6543, app)
    server.serve_forever()


if __name__ == '__main__':
    main()
