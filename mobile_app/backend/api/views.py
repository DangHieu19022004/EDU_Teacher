from rest_framework import viewsets
from scan_orc.models import Receipt

from .serializers import ReceiptSerializer


class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
