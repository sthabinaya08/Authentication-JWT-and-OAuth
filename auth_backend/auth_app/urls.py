# accounts/urls.py
from django.urls import path
from .views import (
    RegisterView, LoginTokenView, GoogleLoginView, ProfileView, LogoutView,
    PasswordResetRequestView, PasswordResetConfirmView
)
from rest_framework_simplejwt.views import TokenRefreshView

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginTokenView.as_view(),
         name="login"),  # returns access+refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("google-login/", GoogleLoginView.as_view(), name="google_login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("password-reset/", PasswordResetRequestView.as_view(),
         name="password-reset"),
    path("password-reset-confirm/<int:uid>/<str:token>/",
         PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
