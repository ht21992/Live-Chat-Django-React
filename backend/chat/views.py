from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message, Room
from .serializers import MessageGetSerializer, MessageUpdateSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_room_message_list(request, sender_id, reciever_id):
    """API endpoint to retrieve a list of messages for a specific chat room.

    Retrieves the chat room based on the sender and receiver IDs.
    Fetches all messages associated with the chat room.
    Serializes the messages and returns the serialized data.

    Parameters:
    - request: HTTP request object.
    - sender_id: ID of the message sender.
    - receiver_id: ID of the message receiver.

    Returns:
    Response containing serialized message data.

    This API endpoint requires authentication using the IsAuthenticated permission.
    """
    try:
        user_ids = sorted([int(sender_id), int(reciever_id)])
        room_object = Room.objects.get(title=f"chat_{user_ids[0]}-{user_ids[1]}")
        message_objects = room_object.messages.all()
        serializer = MessageGetSerializer(
            message_objects, many=True, context={"user": request.user}
        )
        return Response(serializer.data, status=200)

    except Exception as e:
        print(e)
        return Response({"error": "Error while getting the messages"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_message(request, msg_id):
    """API endpoint to update a specific message.

    Updates the content of a message identified by the provided message ID.
    Only the sender of the message is allowed to perform this action.

    Parameters:
    - request: HTTP request object containing updated message data.
    - msg_id: ID of the message to be updated.

    Returns:
    Response containing the updated message data upon successful update.

    Raises:
    - PermissionDenied (HTTP 403) if the requesting user is not the sender of the message.
    - NotFound (HTTP 404) if the specified message ID does not exist.

    This API endpoint requires authentication using the IsAuthenticated permission.
    """
    try:
        current_msg = Message.objects.get(id=msg_id)
        data = request.data
        if request.user != current_msg.sender:
            return Response({"error": "access denied"}, status=403)

        serializer = MessageUpdateSerializer(current_msg, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()

        return Response(serializer.data, status=200)
    except Exception as e:
        print(e)
        return Response({"error": "Error while updatign the messages"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, msg_id):
    """API endpoint to delete a specific message.

    Deletes the message identified by the provided message ID.
    Only the sender of the message is allowed to perform this action.

    Parameters:
    - request: HTTP request object.
    - msg_id: ID of the message to be deleted.

    Returns:
    Response indicating the success of the delete operation.

    Raises:
    - PermissionDenied (HTTP 403) if the requesting user is not the sender of the message.
    - NotFound (HTTP 404) if the specified message ID does not exist.

    This API endpoint requires authentication using the IsAuthenticated permission.
    """
    try:
        current_msg = Message.objects.get(id=msg_id)

        if request.user != current_msg.sender:
            return Response({"error": "access denied"}, status=403)
        current_msg.delete()
        return Response({"success": "Message deleted"}, status=200)
    except Exception as e:
        print(e)
        return Response({"error": "Error while updatign the messages"}, status=404)
