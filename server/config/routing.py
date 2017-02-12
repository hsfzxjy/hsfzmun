from channels.routing import route, include

from chat.routing import channel_routing as chat_routing

main_routing = [
    include(chat_routing, path=r'^/chat')
]

channel_routing = [
    include(main_routing, path=r'^/ws')
]
