from djongo import models
from bson import ObjectId
import uuid
from Classroom.models import Class

# --- Bảng Students ---
class StudentInfo(models.Model):
    _id = models.ObjectIdField(default=ObjectId, editable=False)
    student_id = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    dob = models.CharField(max_length=20, default='')
    gender = models.CharField(max_length=10, default='Nam')  # Nam, Nữ, Khác
    school = models.CharField(max_length=255, blank=True, default='')
    birthplace = models.CharField(max_length=100, blank=True, default='')
    ethnicity = models.CharField(max_length=50, blank=True, default='Kinh')
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    father_name = models.CharField(max_length=100, blank=True, default='')
    father_job = models.CharField(max_length=100, blank=True, default='')
    mother_name = models.CharField(max_length=100, blank=True, default='')
    mother_job = models.CharField(max_length=100, blank=True, default='')
    guardian_name = models.CharField(max_length=100, blank=True, default='')
    guardian_job = models.CharField(max_length=100, blank=True, default='')
    class_id = models.CharField(max_length=36, blank=True, default='')  # Liên kết với bảng Classes
    parents_email = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return self.name

# --- Bảng ReportCards ---
class ReportCard(models.Model):
    _id = models.ObjectIdField(default=ObjectId, editable=False)
    student_id = models.CharField(max_length=36)  # FK -> Students
    class_id = models.ForeignKey(Class, on_delete=models.CASCADE, null=True)

    school_year = models.CharField(max_length=50)

    # Hạnh kiểm từng năm
    conduct_year1_sem1 = models.CharField(max_length=20, blank=True, default='')
    conduct_year1_sem2 = models.CharField(max_length=20, blank=True, default='')
    conduct_year1_final = models.CharField(max_length=20, blank=True, default='')
    conduct_year2_sem1 = models.CharField(max_length=20, blank=True, default='')
    conduct_year2_sem2 = models.CharField(max_length=20, blank=True, default='')
    conduct_year2_final = models.CharField(max_length=20, blank=True, default='')
    conduct_year3_sem1 = models.CharField(max_length=20, blank=True, default='')
    conduct_year3_sem2 = models.CharField(max_length=20, blank=True, default='')
    conduct_year3_final = models.CharField(max_length=20, blank=True, default='')

    # Điểm trung bình từng năm
    gpa_avg_year1 = models.FloatField(default=0)
    gpa_avg_year2 = models.FloatField(default=0)
    gpa_avg_year3 = models.FloatField(default=0)

    # Học lực từng năm
    academic_perform_year1 = models.CharField(max_length=20, blank=True, default='')
    academic_perform_year2 = models.CharField(max_length=20, blank=True, default='')
    academic_perform_year3 = models.CharField(max_length=20, blank=True, default='')

    # Thông tin khác
    promotion_status = models.CharField(max_length=20, blank=True, default='')  # Lên lớp, Thi lại, Lưu ban
    teacher_comment = models.TextField(blank=True, default='')
    teacher_signed = models.BooleanField(default=False)
    principal_signed = models.BooleanField(default=False)
    approval_date = models.DateField(null=True, blank=True)
    user_id = models.CharField(max_length=100)

    def __str__(self):
        return f"ReportCard of {self.student_id} ({self.school_year})"

# --- Bảng ReportCard_Subject ---
class Subject(models.Model):
    name = models.CharField(max_length=100)
    year = models.IntegerField()  # 1 = lớp 10, 2 = lớp 11, 3 = lớp 12
    year1_sem1_score = models.FloatField(null=True, blank=True)
    year1_sem2_score = models.FloatField(null=True, blank=True)
    year1_final_score = models.FloatField(null=True, blank=True)
    year2_sem1_score = models.FloatField(null=True, blank=True)
    year2_sem2_score = models.FloatField(null=True, blank=True)
    year2_final_score = models.FloatField(null=True, blank=True)
    year3_sem1_score = models.FloatField(null=True, blank=True)
    year3_sem2_score = models.FloatField(null=True, blank=True)
    year3_final_score = models.FloatField(null=True, blank=True)

    class Meta:
        abstract = True

class ReportCardSubject(models.Model):
    _id = models.ObjectIdField(default=ObjectId, editable=False)
    report_card_id = models.CharField(max_length=36)  # FK -> ReportCard
    subjects = models.ArrayField(model_container=Subject)

    def __str__(self):
        return f"Subjects of {self.report_card_id}"
