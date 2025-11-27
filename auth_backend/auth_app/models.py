from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if not password:
            raise ValueError("Superusers must have a password")
        return self.create_user(email, password, **extra_fields)


def user_profile_image_upload_path(instance, filename):
    return f"profiles/{instance.id}/{filename}"


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    role = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    bio = models.TextField(blank=True, null=True)

    # profile picture
    avatar = models.ImageField(
        upload_to=user_profile_image_upload_path, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class OAuthAccount(models.Model):
    PROVIDER_CHOICES = [
        ("google", "Google"),
        # extendable for facebook, apple etc.
    ]
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="oauth_accounts")
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    provider_id = models.CharField(max_length=255)  # sub / id from provider
    extra_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("provider", "provider_id")

    def __str__(self):
        return f"{self.provider}:{self.provider_id}"
