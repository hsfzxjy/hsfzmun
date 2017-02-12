from channels.generic.websockets import JsonWebsocketConsumer

from .serializers import MessageSerializer


class ChatConsumer(JsonWebsocketConsumer):

    http_user = True

    def connect(self, message, **kwargs):
        print('connect')
        message.reply_channel.send({'accept': message.user.is_authenticated()})

    def connection_groups(self, **kwargs):
        user = self.message.user

        return [user.channel_group_name] +\
            [d.channel_group_name for d in user.discussions.all(
            )] if user.is_authenticated() else []

    def receive(self, content, **kwargs):
        print('received')
        serializer = MessageSerializer(data=content)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        data = {'type': 'chat', 'data': serializer.data}

        if message.receiver is not None:
            self.group_send(message.sender.channel_group_name, data)

            if message.receiver.id != message.sender.id:
                self.group_send(message.receiver.channel_group_name, data)
        else:
            self.group_send(message.session_name, data)
