from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from user.models import CustomUser

class CustomUserAdmin(UserAdmin):
    """Custom admin configuration for CustomUser model."""

    # Fields to display in the user change form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'bio', 'thumbnail')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    # Fields to display in the user creation form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

    # Customize list display columns
    list_display = ('email', 'full_name', 'is_active', 'is_staff',)

    # Define search fields for user lookup
    search_fields = ('email', 'full_name')

    # Ordering of users in the admin interface
    ordering = ('email',)

# Register CustomUser model with CustomUserAdmin
admin.site.register(CustomUser, CustomUserAdmin)
