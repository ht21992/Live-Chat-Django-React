from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager

# exceptions
from django.core.exceptions import ValidationError

# validator
from django.core.validators import FileExtensionValidator

from io import BytesIO
from PIL import Image
from django.core.files import File

from django.core.cache import cache
import datetime
from django.conf import settings


def file_size(value, limit: int = 1 * 1024 * 1024):
    """
    Summary:
        This function will validate the file size
    Args:
        value (ImageFieldFile): it refers to the uploaded Image by the user
        limit (int) : it refers to the maximum size of the file

    Raises:
        ValidationError: if the size of uploaded image is more than the limit,
        the validationerror will be raised
    """
    if value.size > limit:
        raise ValidationError("Image size should not exceed 1 Mb.")


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(blank=True, default="Anonymous", max_length=255)
    bio = models.CharField(blank=True, default="", max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    thumbnail = models.ImageField(
        upload_to="uploads/",
        validators=[
            file_size,
            FileExtensionValidator(["png", "jpg", "jpeg", "webp", "jfif"]),
        ],
        blank=True,
        null=True,
    )
    date_joined = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = "email"

    objects = UserManager()

    def __str__(self) -> str:
        return self.email

    def make_thumbnail(self, image, size=(400, 300)):
        img = Image.open(image)
        img.convert("RGB")
        img.thumbnail(size)

        thumb_io = BytesIO()
        try:
            img.save(thumb_io, "JPEG", quality=85)
            thumbnail = File(thumb_io, name=image.name)
            return thumbnail
        except OSError:
            return ""

    def save(self, *args, **kwargs):
        if self.pk is None:  # user is being created
            if self.thumbnail:
                self.thumbnail = self.make_thumbnail(self.thumbnail)
        else:
            # Check if the thumbnail field has been modified in the current save operation
            if self.thumbnail and isinstance(self.thumbnail, str):
                self.thumbnail = self.make_thumbnail(self.thumbnail)
        super().save(*args, **kwargs)

    def last_seen(self):
        """
            this method gets user last seen from the cache
        Returns:
            str or None
        """
        return cache.get(f"seen_{self}")

    def online(self) -> bool:
        """
           This method is responsible to check whether the user is online or not

        Returns:
            bool : true or false
        """
        if self.last_seen():
            now = datetime.datetime.now()
            if now > (
                self.last_seen()
                + datetime.timedelta(seconds=settings.USER_ONLINE_TIMEOUT)
            ):
                return False
            else:
                return True
        else:
            return False
