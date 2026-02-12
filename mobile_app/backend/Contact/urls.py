from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from .views import save_parent, get_parents, schedule_email, send_email_now, get_scheduled_emails, update_email_schedule, delete_email_schedule

urlpatterns = [
    path('save_parent/', save_parent),
    path('get_parents/', get_parents),
    path('schedule_email/', schedule_email),
    path('send_email_now/', send_email_now),
    path('get_scheduled_emails/', get_scheduled_emails),
    path('update_email_schedule/', update_email_schedule),
    path('delete_email_schedule/', delete_email_schedule),
]
