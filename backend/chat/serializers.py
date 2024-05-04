from rest_framework import serializers
from .models import Message
from user.serializers import UserGetSerializer


class MessageGetSerializer(serializers.ModelSerializer):
    sender = UserGetSerializer()
    recipients = UserGetSerializer(many=True)
    message = serializers.CharField(source="content")

    class Meta:
        model = Message
        fields = [
            "id",
            "room",
            "sender",
            "message",
            "recipients",
            "timestamp",
            "is_read",
            "is_edited",
        ]
        extra_kwargs = {
            "room": {"read_only": True},
            "sender": {"read_only": True},
            "recipients": {"read_only": True},
        }


class MessageUpdateSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source="content")

    class Meta:
        model = Message
        fields = ["room", "message", "is_read", "is_edited", "id"]
        extra_kwargs = {"id": {"read_only": True}}


    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            # Update 'is_read' if validated_data['is_read'] is True and instance.is_read is False
            if attr == "is_read" and instance.is_read:
                continue
            # Update 'is_read' if validated_data['is_read'] is True and instance.is_read is False
            if attr == "is_edited" and instance.is_edited:
                continue
            setattr(instance, attr, value)
        instance.save()
        return instance
