from .consumers import NoticeConsumer

channel_routing = [NoticeConsumer.as_route()]
