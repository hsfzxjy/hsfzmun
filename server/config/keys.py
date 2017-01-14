class DB:
    user = 'root'
    password = '12345'
    host = '127.0.0.1'
    port = 3306
    name = 'hsfzmun'

SECRET_KEY = '5hp*)$$zan$rby&*jtk446tlrq-iwr)0!qmw)dl+e&xaw5f@kg'

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATICFILES_DIRS = [os.path.join(BASE_DIR, '../front-end/build/')]
