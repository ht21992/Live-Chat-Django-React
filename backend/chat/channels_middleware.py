from rest_framework.exceptions import AuthenticationFailed
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from user.token_authentication import JWTAuthentication


class JWTWebSocketMiddleware(BaseMiddleware):
    """
    Middleware for authenticating WebSocket connections using JWT (JSON Web Token).

    This middleware closes old database connections before processing the WebSocket connection
    and handles authentication of the WebSocket connection using JWTAuthentication.

    Attributes:
        authentication (JWTAuthentication): An instance of JWTAuthentication for handling JWT authentication.
    """

    async def __call__(self, scope, receive, send):
        """
        Process the WebSocket connection.

        Args:
            scope (dict): WebSocket scope containing information about the connection.
            receive (coroutine): Asynchronous coroutine to receive messages from the WebSocket.
            send (coroutine): Asynchronous coroutine to send messages to the WebSocket.

        Returns:
            None
        """
        close_old_connections()  # Close old database connections

        # Extract token from query parameters
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_parameters = dict(qp.split("=") for qp in query_string.split("&"))
        token = query_parameters.get("token", None)

        if not token:
            # Close WebSocket connection if token is missing
            await send({"type": "websocket.close", "code": 4000})
            return

        authentication = JWTAuthentication()

        try:
            # Authenticate the WebSocket connection using JWT
            user = await authentication.authenticate_websocket(scope, token)

            if user:
                scope["user"] = user
            else:
                # Close WebSocket connection if authentication fails
                await send({"type": "websocket.close", "code": 4000})

            # Call the parent middleware to process the WebSocket connection
            return await super().__call__(scope, receive, send)

        except AuthenticationFailed:
            # Close WebSocket connection if authentication raises AuthenticationFailed
            await send({"type": "websocket.close", "code": 4002})
