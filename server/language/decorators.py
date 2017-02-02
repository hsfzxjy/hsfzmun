from functools import wraps


def filter_lang(func):

    @wraps(func)
    def wrapped(self, *args, **kwargs):
        qs = func(self, *args, **kwargs)

        return qs.set_lang_from_request(self.request)

    return wrapped

# DELETE
