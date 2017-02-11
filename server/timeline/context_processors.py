from django.core.serializers.json import DjangoJSONEncoder
from django.utils.timezone import get_current_timezone, now
from functools import partial
from datetime import datetime

make_datetime = partial(datetime, tzinfo=get_current_timezone())
encoder = DjangoJSONEncoder()


def timeline_context_processor(request):

    timeline_config = {
        'start_real': now(),
        'start_fake': make_datetime(2001, 9, 11),
        'periods': [  # (Seconds, speed)
            [5, 4],
            [5, 1 / 4],
        ]
    }

    timeline_config['periods'] = [
        {'duration': period, 'speed': speed}
        for period, speed in timeline_config['periods']
    ]

    timeline_data = encoder.encode(timeline_config)

    return {'timeline_data': timeline_data}
