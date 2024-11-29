from api.views import ReceiptViewSet
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from scan_orc.views import export_image, process_image, recieve_image

from . import settings

router = DefaultRouter()
router.register(r'receipts', ReceiptViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('orc/', include('scan_orc.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
