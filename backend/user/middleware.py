from datetime import datetime
from django.core.cache import cache
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from .token_authentication import TokenBlacklist
import jwt


class ActiveUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """Process incoming requests."""
        token = self.extract_token(request)

        if not token:
            return

        if TokenBlacklist.is_blacklisted(token):
            return

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        if not self.is_verified(payload=payload):
            return

        now = datetime.now()
        cache.set(f"seen_{payload['email']}", now, settings.USER_LASTSEEN_TIMEOUT)

    def extract_token(slef, request):
        """Extract JWT token from request headers."""
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ")[1]
        return None

    def is_verified(self, payload):
        """Verify the JWT payload."""
        if "exp" not in payload:
            return False

        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()

        if current_timestamp > exp_timestamp:
            return False

        return True
