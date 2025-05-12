from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from Contact.models import Parent
from ocr.models import StudentInfo
from Classroom.models import Class
from django.core.mail import send_mail
import uuid
from Contact.models import EmailSchedule
from django.utils import timezone
from bson import ObjectId


@api_view(['POST'])
def delete_email_schedule(request):
    try:
        email_id = request.data.get('id')
        if not email_id:
            return Response({'error': 'Thiếu id email cần xoá'}, status=400)

        email = EmailSchedule.objects.get(_id=ObjectId(email_id))
        email.delete()

        return Response({'message': 'Đã xoá email thành công'})
    except EmailSchedule.DoesNotExist:
        return Response({'error': 'Không tìm thấy email'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_email_schedule(request):
    try:
        email_id = request.data.get('id')
        subject = request.data.get('subject')
        recipients = request.data.get('recipients')
        message = request.data.get('message')
        scheduled_date = request.data.get('scheduled_date')
        status = request.data.get('status')

        if not email_id:
            return Response({'error': 'Thiếu id email cần cập nhật'}, status=400)

        email = EmailSchedule.objects.get(_id=ObjectId(email_id))

        if subject:
            email.subject = subject
        if recipients:
            email.recipients = recipients
        if message:
            email.message = message
        if scheduled_date:
            email.scheduled_date = scheduled_date
        if status:
            email.status = "pending" if status == "pending" else "sent"

        email.save()
        return Response({'message': 'Đã cập nhật email thành công'})

    except EmailSchedule.DoesNotExist:
        return Response({'error': 'Không tìm thấy email cần cập nhật'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_scheduled_emails(request):
    teacher_id = request.GET.get('teacher_id')
    if not teacher_id:
        return Response({'error': 'Thiếu teacher_id'}, status=400)

    emails = EmailSchedule.objects.filter(teacher_id=teacher_id).order_by('-scheduled_date')
    data = [{
        'id': str(e._id),
        'subject': e.subject,
        'recipients': e.recipients,
        'message': e.message,
        'scheduledDate': e.scheduled_date.isoformat(),
        'status': e.status
    } for e in emails]

    return Response(data)

@api_view(['POST'])
def send_email_now(request):
    try:
        subject = request.data.get('subject')
        recipient = request.data.get('recipient')
        message = request.data.get('message')

        if not all([subject, recipient, message]):
            return Response({'error': 'Thiếu dữ liệu'}, status=400)

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

        try:
            email = EmailSchedule.objects.get(
                subject=subject,
                recipients=recipient,
                message=message,
                status='pending'
            )
            email.status = 'sent'
            email.save()
        except EmailSchedule.DoesNotExist:
            pass

        return Response({'message': 'Đã gửi email thành công'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def schedule_email(request):
    try:
        subject = request.data.get('subject')
        recipient = request.data.get('recipient')  # 1 email
        message = request.data.get('message')
        scheduled_time = request.data.get('scheduled_time')  # ISO 8601
        teacher_id = request.data.get('teacher_id')

        if not all([subject, recipient, message, scheduled_time, teacher_id]):
            return Response({'error': 'Thiếu dữ liệu'}, status=400)

        email = EmailSchedule.objects.create(
            subject=subject,
            recipients=recipient,
            message=message,
            scheduled_date=scheduled_time,
            status='pending',
            teacher_id=teacher_id,
            created_at=timezone.now()
        )

        return Response({
            'message': 'Đã lên lịch gửi email',
            'email_id': str(email._id)  # trả về _id của MongoDB
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def save_parent(request):
    try:
        teacher_id = request.data.get('teacher_id')
        student_id = request.data.get('student_id')
        full_name = request.data.get('full_name')
        email = request.data.get('email')
        phone = request.data.get('phone')

        if not all([teacher_id, student_id, full_name, email, phone]):
            return Response({'error': 'Thiếu thông tin'}, status=400)

        Parent.objects.create(
            parent_id=str(uuid.uuid4()),
            teacher_id=teacher_id,
            student_id=student_id,
            full_name=full_name,
            email=email,
            phone=phone
        )

        return Response({'message': 'Lưu phụ huynh thành công'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_parents(request):
    try:
        teacher_id = request.GET.get('teacher_id')
        if not teacher_id:
            return Response({'error': 'Thiếu teacher_id'}, status=400)

        parents = Parent.objects.filter(teacher_id=teacher_id).order_by('-created_at')

        data = []
        for p in parents:
            try:
                student = StudentInfo.objects.get(student_id=p.student_id)
                student_name = student.name

                try:
                    class_obj = Class.objects.get(id=student.class_id)
                    student_class = class_obj.name
                except Class.DoesNotExist:
                    student_class = '(Không tìm thấy lớp)'

            except StudentInfo.DoesNotExist:
                student_name = '(Không tìm thấy)'
                student_class = ''

            data.append({
                'id': p.parent_id,
                'parentName': p.full_name,
                'email': p.email,
                'phone': p.phone,
                'studentId': p.student_id,
                'studentName': student_name,
                'studentClass': student_class,
                'relationship': 'Phụ huynh',
                'teacherId': p.teacher_id,
                'created_at': p.created_at
            })

        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
