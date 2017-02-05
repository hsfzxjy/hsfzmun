from channels.generic.websockets import JsonWebsocketConsumer


class ChatConsumer(JsonWebsocketConsumer):

    http_user = True

    def connect(self, message, **kwargs):
        message.reply_channel.send({'accept': message.user.is_authenticated()})

    def connection_groups(self, **kwargs):
        user = self.message.user

        return [user.channel_group_name] +\
            [d.channel_group_name for d in user.discussions.all()]

    def receive(self, content, **kwargs):
        print(content)
        self.send({'accept': True})
