from django.db import models

class User(models.Model):
    uid = models.CharField(max_length=100, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    avatar = models.URLField(null=True, blank=True)
    password_hash = models.CharField(max_length=500)
    fingerprint = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.BigIntegerField(null=True, blank=True)
    last_sign_in_time = models.BigIntegerField(null=True, blank=True)

    def __str__(self):
        return self.full_name

class VerificationCode(models.Model):
    identifier = models.CharField(max_length=255, unique=True)  # Email hoặc số điện thoại
    otp_code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.identifier} - {self.otp_code}"
