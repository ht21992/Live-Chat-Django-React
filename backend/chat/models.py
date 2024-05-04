from django.db import models
from user.models import CustomUser


class Room(models.Model):
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Message(models.Model):
    room = models.ForeignKey(Room, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(
        CustomUser, related_name="sent_messages", on_delete=models.CASCADE
    )
    recipients = models.ManyToManyField(CustomUser, related_name="recipients")
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.email} - {self.content[:10]}"
