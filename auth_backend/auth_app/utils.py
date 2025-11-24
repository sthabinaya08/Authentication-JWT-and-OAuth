# accounts/utils.py
import requests
from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site


def verify_google_id_token(id_token, audience=None):
    """
    Verify a Google ID token using Google's tokeninfo endpoint.
    Returns payload dict if valid, otherwise raises ValueError.
    """
    # Use the tokeninfo endpoint
    url = "https://oauth2.googleapis.com/tokeninfo"
    resp = requests.get(url, params={"id_token": id_token}, timeout=5)
    if resp.status_code != 200:
        raise ValueError("Invalid ID token")
    payload = resp.json()
    # payload contains "aud" (client_id) and "sub" (user id)
    if audience is None:
        audience = getattr(settings, "GOOGLE_CLIENT_ID", None)
    if audience and payload.get("aud") != audience:
        raise ValueError("Token audience mismatch")
    return payload


def send_password_reset_email(request, user, token):
    """
    Build a password reset link and send email.
    You can customize templates.
    """
    current_site = get_current_site(request)
    reset_path = reverse("accounts:password-reset-confirm",
                         kwargs={"uid": user.pk, "token": token})
    reset_url = f"{request.scheme}://{current_site.domain}{reset_path}"
    subject = "Password reset for your account"
    message = f"Hi {user.first_name or user.email},\n\nUse the link below to reset your password:\n{reset_url}\n\nIf you didn't ask for this, ignore."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
