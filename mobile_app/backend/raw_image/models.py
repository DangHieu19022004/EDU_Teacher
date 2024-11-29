from django.db import models


class RawImage(models.Model):
    id = models.AutoField(primary_key=True)  # ID duy nhất
    image_path = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.image_path}"
