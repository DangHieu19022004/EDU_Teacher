from djongo import models
import uuid

class StudentInfo(models.Model):
    _id = models.ObjectIdField()
    student_id = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    dob = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    school = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100)
    hk1 = models.CharField(max_length=10)
    hk2 = models.CharField(max_length=10)
    cn = models.CharField(max_length=10)

    class Meta:
        abstract = True

class ReportCard(models.Model):
    _id = models.ObjectIdField()
    student_id = models.CharField(max_length=36)  # liên kết với StudentInfo.student_id
    class_name = models.CharField(max_length=50)
    academic_performance = models.CharField(max_length=50)
    conduct = models.CharField(max_length=50)
    subjects = models.ArrayField(
        model_container=Subject,
    )

    def __str__(self):
        return f"Bảng điểm {self.class_name} - {self.student_id}"
