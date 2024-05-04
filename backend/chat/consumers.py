from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from .models import Room, Message
from user.models import CustomUser
from django.db.models import Count
from .serializers import MessageGetSerializer


class PersonalChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """Handles WebSocket connection request.

        If the user is authenticated, sets up a chat session between the requesting
        user and another user specified by the 'id' parameter in the URL route.
        Otherwise, rejects the connection.

        This method is part of the WebSocket consumer protocol in Django Channels.

        Parameters:
        - self: The WebSocket consumer instance.
        """
        request_user = self.scope.get("user")
        if request_user.is_authenticated:
            chat_with_user = self.scope["url_route"]["kwargs"]["id"]
            user_ids = sorted([int(request_user.id), int(chat_with_user)])
            self.room_group_name = f"chat_{user_ids[0]}-{user_ids[1]}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def receive(self, text_data=None, byte_data=None):
        """Handles incoming WebSocket messages.

        Parses incoming JSON data to process different types of messages:
        - 'message_read': Updates unread message count and broadcasts read status.
        - 'typing': Broadcasts typing status to other users in the chat.
        - 'message': Saves the incoming message and broadcasts it to the chat room,
        along with updated unread message counts.

        Parameters:
        - self: The WebSocket consumer instance.
        - text_data: The incoming message data in JSON format.
        - byte_data: Unused binary data (for compatibility with Django Channels).

        Expected JSON Structure:
        {
            "sender": {"id": sender_id},
            "recipient": {"id": recipient_id},
            "message_read": [message_id],
            "message": "message_text",
            "typing": true/false
        }

        The 'message_read' key is used for acknowledging read messages.
        The 'typing' key indicates whether the sender is typing a message.

        This method is part of the WebSocket consumer protocol in Django Channels.
        """
        data = json.loads(text_data)
        sender = data.get("sender")
        recipient = data.get("recipient")
        if "message_read" in data:
            read_msg_id, unread_counter = await self.update_unread_message_counter(
                data["message_read"], sender, recipient
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "read_message",
                    "read_msg_id": read_msg_id,
                    "unread_counter": unread_counter,
                },
            )
            return

        message = data.get("message")
        typing = data.get("typing")

        if typing:
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "typing_message", "typing": True, "sender": sender},
            )
        else:
            new_message = await self.save_message(
                sender["id"], recipient["id"], message
            )
            unread_count_list = await self.get_all_unread_message_count(recipient["id"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "msg_id": new_message.id,
                    "type": "chat_message",
                    "unread_count_list": unread_count_list,
                },
            )

    @sync_to_async
    def get_all_unread_message_count(self, recipient_id):
        """Asynchronously retrieves the count of unread messages for each sender
        received by a specified recipient.

        Parameters:
        - recipient_id: The ID of the recipient user.

        Returns:
        A list of dictionaries containing sender IDs and their respective
        unread message counts. Example:
        [
            {"sender__id": sender_id_1, "count": unread_count_1},
            {"sender__id": sender_id_2, "count": unread_count_2},
            ...
        ]

        This method is intended to be used with Django Channels and Django ORM,
        utilizing async functionality with sync_to_async.

        Note: This method should be called within an asynchronous context.

        """
        unread_count_list = list(
            Message.objects.filter(recipients__id=recipient_id, is_read=False)
            .values("sender__id")
            .annotate(count=Count("id"))
        )
        return unread_count_list

    @sync_to_async
    def get_created_message(self, msg_id):
        """Asynchronously retrieves a serialized representation of the message with the specified ID.

        Parameters:
        - msg_id: The ID of the message to retrieve.

        Returns:
        A dictionary containing the serialized message data. The serialization
        is performed using MessageGetSerializer with the current user's context.

        This method is intended for use with Django Channels and Django ORM,
        utilizing async functionality with sync_to_async.

        Note: Call this method within an asynchronous context.
        """
        msg = Message.objects.get(id=msg_id)
        serializer = MessageGetSerializer(msg, context={"user": self.scope.get("user")})
        return serializer.data

    @sync_to_async
    def save_message(self, sender_id, recipient_id, message):
        """Asynchronously saves a message to the database.
        Parameters:
        - sender_id: ID of the message sender.
        - recipient_id: ID of the message recipient.
        - message: Content of the message.

        Returns:
        The saved Message object.

        This method is intended for use with Django Channels and Django ORM,
        utilizing async functionality with sync_to_async.

        Note: Call this method within an asynchronous context.
        """
        room = Room.objects.get_or_create(title=self.room_group_name)[0]
        sender = CustomUser.objects.get(id=sender_id)
        recipient = CustomUser.objects.get(id=recipient_id)
        message = Message.objects.create(room=room, sender=sender, content=message)
        message.recipients.add(recipient)
        return message

    async def disconnect(self, close_code):
        """Handles WebSocket disconnection.

        Removes the channel from the room group associated with the chat session,
        allowing the user to cleanly disconnect from the chat.

        Parameters:
        - close_code: The WebSocket close code indicating the reason for disconnection.

        This method is part of the WebSocket consumer protocol in Django Channels.
        """
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chat_message(self, event):
        """Handles broadcasting a chat message to connected clients.

        Retrieves the message details based on the provided event data,
        including the message ID and unread message count list. Sends the
        serialized message data along with the updated unread message counts
        to all clients in the chat room.

        Parameters:
        - event: Dictionary containing message details and unread count list.

        This method is part of the WebSocket consumer protocol in Django Channels.
        """
        msg_id = event["msg_id"]
        unread_count_list = event["unread_count_list"]
        message = await self.get_created_message(msg_id)
        await self.send(
            text_data=json.dumps(
                {
                    "message": message,
                    "unread_count_list": unread_count_list,
                }
            )
        )

    async def read_message(self, event):
        """Handles broadcasting a read message event to connected clients.

        Retrieves the read message ID and updated unread message counter
        from the provided event data. Sends a notification to clients
        indicating that the specified message has been read and includes
        the updated unread message counter.

        Parameters:
        - event: Dictionary containing the read message ID and unread counter.

        This method is part of the WebSocket consumer protocol in Django Channels.
        """
        read_msg_id = event.get("read_msg_id")
        unread_counter = event.get("unread_counter")
        await self.send(
            text_data=json.dumps(
                {
                    "read_msg": True,
                    "msg_id": read_msg_id,
                    "unread_counter": unread_counter,
                }
            )
        )

    async def typing_message(self, event):
        """Handles broadcasting a typing indicator to connected clients.

        Retrieves the sender's information and typing status from the provided event data.
        If the sender is currently typing and is not the current user, sends a notification
        to clients indicating that the sender is typing.

        Parameters:
        - event: Dictionary containing sender information and typing status.

        This method is part of the WebSocket consumer protocol in Django Channels.
        """
        sender = event.get("sender")
        typing = event.get("typing")
        if typing and str(sender["id"]) != str(self.scope["user"].id):
            await self.send(
                text_data=json.dumps(
                    {"typing": True, "text": f"{sender['full_name']} is typing"}
                )
            )

    @sync_to_async
    def update_unread_message_counter(self, message_id, sender, recipient):
        """Asynchronously updates the unread message counter for the recipient.

        Marks the specified message as read. Retrieves the updated count of
        unread messages for the recipient based on the message sender's email.

        Parameters:
        - message_id: ID of the message to mark as read.
        - sender: Dictionary containing sender information.
        - recipient: Dictionary containing recipient information.

        Returns:
        A tuple containing the ID of the updated message and the new unread counter.

        This method is intended for use with Django Channels and Django ORM,
        utilizing async functionality with sync_to_async.

        Note: Call this method within an asynchronous context.
        """
        message = Message.objects.get(id=message_id)
        message.is_read = True
        unread_counter = Message.objects.filter(
            sender__email=recipient["email"],
            recipients__email=sender["email"],
            is_read=False,
        ).count()
        message.save()
        return message.id, unread_counter
