from api.views import ReceiptViewSet
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import settings

router = DefaultRouter()
router.register(r'receipts', ReceiptViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('ocr/', include('scan_orc.urls')),
    path('raw/', include('raw_image.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
