from django.core.serializers.json import DjangoJSONEncoder
from django.utils.timezone import get_current_timezone
from functools import partial
from datetime import datetime

make_datetime = partial(datetime, tzinfo=get_current_timezone())
encoder = DjangoJSONEncoder()

timeline_config = {
    'start_real': make_datetime(2017, 2, 25, 21),
    'start_fake': make_datetime(1948, 9, 20),
    'periods': [  # (Seconds, speed)
        [576000, 1],
        [28800, 24],
        [41400, 12],
        [30600, 24],
    ]
}

timeline_config['periods'] = [
    {'duration': period, 'speed': speed}
    for period, speed in timeline_config['periods']
]

timeline_data = encoder.encode(timeline_config)


def timeline_context_processor(request):

    return {'timeline_data': timeline_data}
