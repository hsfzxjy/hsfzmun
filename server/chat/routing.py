from .consumers import ChatConsumer


channel_routing = [
    ChatConsumer.as_route()
]
