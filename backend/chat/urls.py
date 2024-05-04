# user/urls.py
from . import views
from django.urls import path


urlpatterns = [
    path(
        "chat_list/<int:sender_id>/<int:reciever_id>",
        views.get_room_message_list,
        name="get_room_message_list",
    ),
    path("update/<int:msg_id>/", views.update_message, name="update_message"),
    path("delete/<int:msg_id>/", views.delete_message, name="delete_message"),
]
