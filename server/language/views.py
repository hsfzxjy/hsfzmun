from django.utils.translation import LANGUAGE_SESSION_KEY
from django.shortcuts import redirect


def set_language(request, lang_code):
    request.session[LANGUAGE_SESSION_KEY] = lang_code

    return redirect('/')
