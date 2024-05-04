import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from channels.db import database_sync_to_async

from django.core.cache import cache
from django.core.cache.backends.base import DEFAULT_TIMEOUT


User = get_user_model()


class TokenBlacklist:
    @staticmethod
    def add_to_blacklist(token):
        try:
            cache.set(token, True, timeout=DEFAULT_TIMEOUT)
        except Exception as e:
            print(f"Error setting cache: {e}")

    @staticmethod
    def is_blacklisted(token):
        try:
            return cache.get(token) is not None
        except Exception as e:
            print(f"Error getting cache: {e}")
            return False


class JWTAuthentication(BaseAuthentication):

    def authenticate(self, request):
        """Authenticate the user using JWT token in HTTP Authorization header."""
        token = self.extract_token(request=request)
        if not token:
            return None

        if TokenBlacklist.is_blacklisted(token):
            raise AuthenticationFailed("Token is blacklisted")

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.verify_token(payload=payload)
            user_id = payload["id"]
            user = User.objects.get(id=user_id)

            return (user, None)
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid or Expired Token")

    def verify_token(self, payload):
        """Verify the JWT token payload."""
        if "exp" not in payload:
            raise InvalidTokenError("Token has no expiration time")

        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()

        if current_timestamp > exp_timestamp:
            raise ExpiredSignatureError("Token has been expired already")

    def extract_token(slef, request):
        """Extract JWT token from HTTP Authorization header."""
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ")[1]
        return None

    @database_sync_to_async
    def authenticate_websocket(self, scope, token):
        """Authenticate WebSocket connection using JWT token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.verify_token(payload=payload)
            user_id = payload["id"]
            user = User.objects.get(id=user_id)
            return user
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid or expired token")

    @staticmethod
    def generate_token(payload):
        """Generate a JWT token with the specified payload."""
        expiration = datetime.utcnow() + timedelta(hours=24)
        payload["exp"] = expiration
        token = jwt.encode(payload=payload, key=settings.SECRET_KEY, algorithm="HS256")
        return token
