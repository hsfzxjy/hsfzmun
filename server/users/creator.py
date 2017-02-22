import xlrd
import re

from .models import User

from django.contrib import messages
from django.utils.translation import gettext as _
from functools import partial


class FailToCreate(Exception):

    def __init__(self, details):
        self.details = details
        super(FailToCreate, self).__init__()


def error(raw_data, other=None):
    details = {'raw_data': raw_data}
    if other is not None:
        details.update(other)

    raise FailToCreate(details)


def create_from_excel(request):

    try:
        excel_file = xlrd.open_workbook(
            file_contents=request.FILES['users'].read())
    except:
        messages.warning(request, _('File not upload.'))
        raise FailToCreate({})

    try:
        data_sheet = excel_file.sheet_by_name('DATA')
    except:
        messages.warning(request, _('DATA sheet not found.'))
        raise FailToCreate({})

    raw_data = []

    for i in range(data_sheet.nrows):
        data = data_sheet.row_values(i)
        try:
            raw_data.append((data[0], data[1], data[2]))
        except:
            messages.warning(
                request,
                _('Row %s has invalid arguments number.' % (i + 1)))
            raise FailToCreate({})

    return create(request, raw_data)


def create_from_string(request, string):

    raise_error = partial(error, string)
    raw_data = []
    lines = filter(bool, map(lambda s: s.strip(), re.split(r'\n+', string)))
    for i, line in enumerate(lines):
        data = re.split(r'\s+', line)
        try:
            raw_data.append((data[0], data[1], data[2]))
        except:
            messages.warning(
                request,
                _('Row %s has invalid arguments number.' % (i + 1)))
            raise_error()

    return create(request, raw_data, raise_error)


lang_map = {
    'z': 'zh-hans',
    'e': 'en-us',
    'a': 'all',
}


def create(request, raw_data, raise_error=lambda: None):
    created_users = []

    for username, nickname, lang in raw_data:
        try:
            lang_code = lang_map[lang]
        except KeyError:
            messages.warning(
                request, _('Invalid language code for user %s.') % username)
            raise_error({'created': created_users})

        try:
            user, created = User.objects.update_or_create(
                username=username, defaults={'nickname': nickname,
                                             'lang_code': lang_code})
        except:
            messages.warning(request,
                             _('Duplicate nickname %s.') % nickname
                             )
            raise_error({'created': created_users})

        is_new_user = True

        if created:
            user.set_password(user.initial_password)
            user.save()
        else:
            is_new_user = user.check_password(user.initial_password)

        if is_new_user:
            created_users.append([user, created])

    return created_users
