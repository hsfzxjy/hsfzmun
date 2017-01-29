from time import time


def timestamp():
    return str(time())


def make_file_name(name):
    return '/'.join([timestamp(), name])
