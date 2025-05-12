from djongo import models
import uuid

class Class(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)  # VD: 10A1
    teacher_id = models.CharField(max_length=100)    # Liên kết đến bảng Teachers
    school_name = models.CharField(max_length=255)
    class_year = models.CharField(max_length=50)  # VD: K64, 2022-2025

    def __str__(self):
        return f"{self.name} - {self.class_year}"
