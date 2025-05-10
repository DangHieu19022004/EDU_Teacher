from django.db import models

class User(models.Model):
    uid = models.CharField(max_length=100, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    avatar = models.URLField()
    password_hash = models.CharField(max_length=500)
    fingerprint = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.BigIntegerField(null=True, blank=True)
    last_sign_in_time = models.BigIntegerField(null=True, blank=True)

    def __str__(self):
        return self.full_name
