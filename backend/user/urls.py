# user/urls.py
from . import views
from django.urls import path


urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("logout/", views.logout_user, name="logout"),
    path(
        "is_authenticated/",
        views.TokenValidationView.as_view(),
        name="is_authenticated",
    ),
    path("users_list/", views.get_user_list, name="users_list"),
    path("update_user/", views.update_user, name="update_user"),
]
