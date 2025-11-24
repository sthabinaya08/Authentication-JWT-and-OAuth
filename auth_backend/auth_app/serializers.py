from rest_framework import serializers
from .models import User, OAuthAccount
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "password", "first_name",
                  "last_name", "phone", "address", "role")

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError(
                    "Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError(
                "Must include 'email' and 'password'.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone",
                  "address", "role", "avatar", "date_joined")


class OAuthAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = ("provider", "provider_id", "extra_data", "created_at")
