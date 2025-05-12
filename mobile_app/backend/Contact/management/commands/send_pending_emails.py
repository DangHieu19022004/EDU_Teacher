from django.core.management.base import BaseCommand
from django.utils import timezone
from Contact.models import EmailSchedule
from django.core.mail import send_mail

class Command(BaseCommand):
    help = 'Gửi email đúng lịch từ bảng EmailSchedule'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        emails = EmailSchedule.objects.filter(status='pending', scheduled_date__lte=now)
        for email in emails:
            try:
                send_mail(
                    subject=email.subject,
                    message=email.message,
                    from_email='danghieu19022004@gmail.com',
                    recipient_list=[email.recipients],
                    fail_silently=False
                )
                email.status = 'sent'
                email.save()
                self.stdout.write(self.style.SUCCESS(f"✅ Đã gửi: {email.subject}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Lỗi: {str(e)}"))
