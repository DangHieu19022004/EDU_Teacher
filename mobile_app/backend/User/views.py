import json

import requests
from django.contrib.auth import logout
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from .models import User


def home(request):
    return render(request, "home.html")

def logout_view(request):
    logout(request)
    return redirect("/")

# GOOGLE_CLIENT_ID = "163331905540-aos31fq7vlbe6309k39vqk4a65u3e13d.apps.googleusercontent.com"

# @csrf_exempt  # Bỏ CSRF check cho API này
# def google_login(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Only POST requests allowed"}, status=400)

#     try:
#         body = json.loads(request.body)
#         token = body.get("id_token")

#         # Xác thực token từ Google
#         id_info = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

#         if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
#             return JsonResponse({"error": "Invalid issuer"}, status=400)

#         # Kiểm tra user có trong DB chưa, nếu chưa thì tạo mới
#         user, created = User.objects.get_or_create(
#             google_id=id_info["sub"],
#             defaults={"email": id_info["email"], "name": id_info["name"], "avatar": id_info["picture"]}
#         )

#         return JsonResponse({"success": True, "user": {"email": user.email, "name": user.name, "avatar": user.avatar}})

#     except ValueError as e:
#         return JsonResponse({"error": "Invalid token", "details": str(e)}, status=400)

#     except Exception as e:
#         return JsonResponse({"error": "Internal server error", "details": str(e)}, status=500)
