import base64
import logging
import os
from decimal import Decimal
from io import BytesIO

import cv2
import numpy as np
import onnxruntime as ort
from django.conf import settings
from django.forms import model_to_dict
from django.http import JsonResponse
from paddleocr import PaddleOCR
from PIL import Image
from rest_framework.decorators import api_view
from ultralytics import YOLO

from .models import Receipt


@api_view(['POST'])
def getDataReceipt(request):
    data = request.data

    # Lấy dữ liệu từ request
    merchant_name = data.get("merchant_name")
    card_last_digits = data.get("card_last_digits")
    cardholder_name = data.get("cardholder_name")
    card_type = data.get("card_type")
    batch_number = data.get("batch_number")
    transaction_date = data.get("transaction_date")
    total_amount = data.get("total_amount")
    try:
        # total_amount = total_amount[3:]
        total_amount = Decimal(total_amount.replace(".", ""))
    except:
        print("Error: ", total_amount)

    # Lưu ảnh vào MongoDB
    document = Receipt()
    document.merchant_name = merchant_name
    document.card_last_digits = card_last_digits
    document.cardholder_name = cardholder_name
    document.card_type = card_type
    document.batch_number = batch_number
    document.transaction_date = transaction_date
    document.total_amount = total_amount
    document.save()

    document_dict = model_to_dict(document)

    return JsonResponse({"status": "success", "message": "Saved successfully" , "result" : document_dict}, status=200)
