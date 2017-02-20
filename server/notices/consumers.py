from channels.generic.websockets import JsonWebsocketConsumer
from channels import Group

import json


def send_unread(user, reply_channel=None):
    print('exe')
    if not user.is_authenticated():
        return

    unread = user.received_notices.filter(has_read=False).count()

    data = dict(text=json.dumps({
        'type': 'notices',
        'data': unread
    }))

    if reply_channel is not None:
        reply_channel.send(data)
    else:
        Group('notices_{}'.format(user.id)).send(data)


class NoticeConsumer(JsonWebsocketConsumer):

    http_user = True

    def connect(self, message, **kwargs):
        message.reply_channel.send({'accept': message.user.is_authenticated()})
        send_unread(message.user, message.reply_channel)

    def connection_groups(self, **kwargs):
        user = self.message.user

        return ['notices_{}'.format(user.id), user.channel_group_name] \
            if user.is_authenticated() else []
