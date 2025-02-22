from backend import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from firebase_admin import auth
import json
from User.models import User
import jwt
from datetime import datetime, timedelta

SECRET_KEY = settings.SECRET_KEY

@csrf_exempt
def google_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            firebase_id_token = data.get("token")

            # Xác thực token với Firebase
            decoded_token = auth.verify_id_token(firebase_id_token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email")
            full_name = decoded_token.get("name")
            avatar = decoded_token.get("picture")
            metadata = decoded_token.get("firebase", {}).get("sign_in_attributes", {})

            # Tạo hoặc cập nhật user trong MongoDB
            user, created = User.objects.update_or_create(
                uid=uid,
                defaults={
                    "full_name": full_name,
                    "email": email,
                    "phone": "",
                    "avatar": avatar,
                    "password_hash": "",
                    "fingerprint": "",
                    "created_at": metadata.get("createdAt", 0),
                    "last_sign_in_time": metadata.get("lastLoginAt", 0),
                }
            )

            payload = {
                "user_id": user.uid,
                "exp": datetime.utcnow() + timedelta(days=30),
                "iat": datetime.utcnow(),
            }
            jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "User authenticated successfully",
                "access_token": jwt_token,
                "user": {
                    "uid": user.uid,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)


@csrf_exempt
def verify_token(request):
    if request.method == "POST":
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Invalid token"}, status=401)

        token = auth_header.split(" ")[1]
        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(uid=decoded_token["user_id"])
            return JsonResponse({
                "message": "Token is valid",
                "user": {
                    "uid": user.uid,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                }
            })
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)

    return JsonResponse({"error": "Invalid request"}, status=400)
