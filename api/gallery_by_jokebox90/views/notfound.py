from pyramid.view import notfound_view_config
from pyramid.response import Response


@notfound_view_config(renderer='gallery_by_jokebox90:templates/404.jinja2')
def notfound_view(request):
    response = Response()
    response.status = 404
    response.json = {"error_message": "Not found."}
    return response
