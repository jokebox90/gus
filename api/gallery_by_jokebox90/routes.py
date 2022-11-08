def includeme(config):
    config.add_static_view("static", "static", cache_max_age=3600)
    config.add_route("collection_options", "/api", request_method="OPTIONS")
    config.add_route("resource_options", "/api/{filename}", request_method="OPTIONS")  # noqa
    config.add_route("index", "/api", request_method="GET")
    config.add_route("create", "/api", request_method="PUT")
    config.add_route("read", "/api/{filename}", request_method="GET")
    config.add_route("update", "/api/{filename}", request_method="PATCH")
    config.add_route("delete", "/api", request_method="DELETE")
    config.add_route("register", "/api/sign-up", request_method="POST")
    config.add_route("login", "/api/sign-in", request_method="POST")
