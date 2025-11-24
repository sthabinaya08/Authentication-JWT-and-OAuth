# accounts/views.py
from rest_framework.views import APIView
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import login as django_login
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import User, OAuthAccount
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, OAuthAccountSerializer
from .utils import verify_google_id_token, send_password_reset_email
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class LoginTokenView(APIView):
    """
    Accepts email/password and returns JWT tokens. We leverage SimpleJWT tokens manually here.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user, context={"request": request}).data
        }
        return Response(data)

# Alternatively you can use TokenObtainPairView provided by simplejwt for standard flow.


class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    """
    Expects: { "id_token": "<google-id-token>" }
    """

    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"detail": "ID token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            payload = verify_google_id_token(id_token)
        except Exception as e:
            return Response({"detail": "Invalid id token", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        provider = "google"
        provider_id = payload.get("sub")
        email = payload.get("email")
        first_name = payload.get("given_name", "")
        last_name = payload.get("family_name", "")
        picture = payload.get("picture")

        if not email:
            return Response({"detail": "Google account does not have an email."}, status=400)

        user = User.objects.filter(email__iexact=email).first()
        created = False
        if not user:
            user = User.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            # set unusable password since it's OAuth
            user.set_unusable_password()
            # optionally save picture to avatar - we could fetch and save; left as optional
            user.save()
            created = True

        # link or update OAuthAccount
        oauth, _ = OAuthAccount.objects.update_or_create(
            provider=provider, provider_id=provider_id,
            defaults={"user": user, "extra_data": payload}
        )

        # create JWT tokens
        refresh = RefreshToken.for_user(user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user, context={"request": request}).data,
            "created": created
        }
        return Response(data)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        """
        To logout, blacklist the refresh token (if using rotating tokens). Client must send refresh token to blacklist.
        """
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token required."}, status=400)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out"}, status=200)
        except Exception as e:
            return Response({"detail": "Invalid token", "error": str(e)}, status=400)


class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email required"}, status=400)
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = default_token_generator.make_token(user)
            send_password_reset_email(request, user, token)
        # Always return success to avoid leaking information
        return Response({"detail": "If that email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, uid, token):
        password = request.data.get("password")
        if not password:
            return Response({"detail": "Password required"}, status=400)
        user = get_object_or_404(User, pk=uid)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=400)
        user.set_password(password)
        user.save()
        return Response({"detail": "Password updated."})
