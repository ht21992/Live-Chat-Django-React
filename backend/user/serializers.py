from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from chat.models import Message
from datetime import datetime
from django.core.serializers import serialize
import json

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=True)

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
        )
        return user

    class Meta:
        model = get_user_model()
        fields = ["email", "password", "full_name"]
        extra_kwargs = {"password": {"write_only": True}}


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255, read_only=True)
    thumbnail = serializers.CharField(max_length=255, read_only=True)
    bio = serializers.CharField(max_length=255, read_only=True)
    id = serializers.CharField(max_length=15, read_only=True)
    password = serializers.CharField(max_length=255, write_only=True)

    def validate(self, data):
        email = data.get("email", "")
        password = data.get("password", "")

        if not email or not password:
            raise serializers.ValidationError("Email and password are mandatory")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid Email or Password")

        if not user.is_active:
            raise serializers.ValidationError("User is not active")

        return {
            "email": user.email,
            "id": user.id,
            "full_name": user.full_name,
            "thumbnail": user.thumbnail.url if user.thumbnail else "",
            "bio": user.bio,
        }


class UserGetSerializer(serializers.ModelSerializer):
    unread_messages_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_seen = serializers.SerializerMethodField()
    online = serializers.SerializerMethodField()

    def get_last_message(self, obj):
        user_ids = sorted([int(self.context["user"].id), int(obj.id)])
        last_msg = Message.objects.filter(room__title=f"chat_{user_ids[0]}-{user_ids[1]}").values("content").last()
        if last_msg:
            return {"message":last_msg["content"]}
        else:
            return None

    def get_unread_messages_count(self, obj):
        myself = self.context["user"]
        return Message.objects.filter(
            sender=obj, recipients=myself, is_read=False
        ).count()

    def get_last_seen(self, obj):
        if obj.last_seen():
            now = datetime.now()

            time_difference = now - obj.last_seen()

            seconds_diff = time_difference.total_seconds()

            if seconds_diff < 60:
                # Less than a minute
                diff_string = f"{int(seconds_diff)} seconds ago"
            elif seconds_diff < 3600:
                # Less than an hour
                diff_string = f"{int(seconds_diff / 60)} minutes ago"
            elif seconds_diff < 86400:
                # Less than a day
                diff_string = f"{int(seconds_diff / 3600)} hours ago"
            else:
                # More than a day
                diff_string = f"{int(seconds_diff / 86400)} days ago"

            return diff_string
        return None

    def get_online(self, obj):
        return obj.online()

    class Meta:
        model = get_user_model()
        fields = [
            "email",
            "id",
            "full_name",
            "thumbnail",
            "bio",
            "unread_messages_count",
            "last_seen",
            "online",
            "last_message",
        ]
        extra_kwargs = {
            "id": {"read_only": True},
            "last_seen": {"read_only": True},
            "online": {"read_only": True},
        }


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["full_name", "bio", "thumbnail", "id"]
        extra_kwargs = {"id": {"read_only": True}}

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
