# --- Bảng Parents ---
from djongo import models
from bson import ObjectId
import uuid

class Parent(models.Model):
    _id = models.ObjectIdField(default=ObjectId, editable=False)
    parent_id = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    student_id = models.CharField(max_length=36)  # Liên kết với StudentInfo.student_id
    teacher_id = models.CharField(max_length=36)  # Thêm dòng này

    full_name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.email} - {self.phone}"

