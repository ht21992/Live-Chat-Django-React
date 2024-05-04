# user/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import (
    UserGetSerializer,
    UserSerializer,
    UserUpdateSerializer,
    LoginSerializer,
)
from .token_authentication import JWTAuthentication, TokenBlacklist
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.core.cache import cache


User = get_user_model()


@api_view(["POST"])
def register_user(request):
    """API endpoint to register a new user."""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def login_user(request):
    """API endpoint to authenticate and log in a user."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        token = JWTAuthentication.generate_token(payload=serializer.data)
        return Response(
            {"message": "Succesful Login", "token": token, "user": serializer.data},
            status=200,
        )
    return Response(serializer.errors, status=400)


class TokenValidationView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """API endpoint to validate user token authentication."""
        try:
            if request.user.is_authenticated:

                return Response({"is_authenticated": True}, status=200)
            else:
                return Response({"is_authenticated": False}, status=200)
        except Exception as e:
            print(e)
            return Response(
                {"error": "sth went wrong while checking the authentication"},
                status=400,
            )


@api_view(["POST"])
def logout_user(request):
    """API endpoint to log out a user and invalidate the token."""
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        TokenBlacklist.add_to_blacklist(token)
        return Response({"message": "Successfully logged out"}, status=200)
    else:
        return Response({"error": "Invalid Token"}, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_list(request):
    """API endpoint to retrieve a list of users."""
    try:
        user_objects = User.objects.exclude(id=request.user.id)
        serializer = UserGetSerializer(
            user_objects, context={"user": request.user}, many=True
        )
        return Response(serializer.data, status=200)
    except Exception as e:
        print(e)
        return Response({"error": "Error while getting the user list"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user(request):
    """API endpoint to update user information."""
    try:

        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)

        return Response(serializer.errors, status=400)

    except Exception as e:
        print(e)
        return Response({"error": "Error while updating the user info"}, status=404)
