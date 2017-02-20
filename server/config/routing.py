from channels.routing import route, include

from chat.routing import channel_routing as chat_routing
from notices.routing import channel_routing as notices_routing

main_routing = [
    include(chat_routing, path=r'^/chat'),
    include(notices_routing, path=r'^/notices')
]

channel_routing = [
    include(main_routing, path=r'^/ws')
]
