from channels.routing import route, include

from chat.routing import channel_routing as chat_routing

channel_routing = [
    include(chat_routing, path=r'^/chat')
]
