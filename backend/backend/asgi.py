
import os
from channels.routing import ProtocolTypeRouter,URLRouter
from chat.routing import websocket_urlpatterns
from channels.auth import AuthMiddlewareStack
from chat.channels_middleware import JWTWebSocketMiddleware

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTWebSocketMiddleware(AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    )),
})
