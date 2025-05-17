from backend import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from firebase_admin import auth
import json
from User.models import User
import jwt
from datetime import datetime, timedelta
import logging
from django.core.cache import cache
import random
from django.core.mail import send_mail

SECRET_KEY = settings.SECRET_KEY

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
SECRET_KEY = settings.SECRET_KEY

@csrf_exempt
def forgot_password_send_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email không được để trống"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Không tìm thấy người dùng với email này"}, status=404)

            otp_code = str(random.randint(100000, 999999))
            cache.set(f"otp_reset:{email}", otp_code, timeout=300)  # 5 phút

            # Gửi email OTP
            send_mail(
                subject="Mã xác thực đặt lại mật khẩu",
                message=f"Mã OTP để đặt lại mật khẩu của bạn là: {otp_code}",
                from_email="danghieu19022004@gmail.com",
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP đã được gửi tới email"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def forgot_password_reset(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            otp = data.get("otp")
            new_password = data.get("new_password")

            if not email or not otp or not new_password:
                return JsonResponse({"error": "Thiếu thông tin"}, status=400)

            cached_otp = cache.get(f"otp_reset:{email}")
            if not cached_otp or cached_otp != otp:
                return JsonResponse({"error": "Mã OTP không hợp lệ hoặc đã hết hạn"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Không tìm thấy người dùng"}, status=404)

            user.password_hash = new_password
            user.save()
            cache.delete(f"otp_reset:{email}")

            return JsonResponse({"message": "Đặt lại mật khẩu thành công"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def change_password(request):
    if request.method == "POST":
        try:
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "Thiếu token hoặc định dạng sai"}, status=401)

            token = auth_header.split(" ")[1]
            try:
                decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_id = decoded_token["user_id"]
            except jwt.ExpiredSignatureError:
                return JsonResponse({"error": "Token đã hết hạn"}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({"error": "Token không hợp lệ"}, status=401)

            data = json.loads(request.body)
            old_password = data.get("old_password", "").strip()
            new_password = data.get("new_password", "").strip()

            if not old_password or not new_password:
                return JsonResponse({"error": "Thiếu mật khẩu cũ hoặc mới"}, status=400)

            # Tìm user trong database
            try:
                user = User.objects.get(uid=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "Không tìm thấy người dùng"}, status=404)

            # Kiểm tra mật khẩu cũ
            if user.password_hash != old_password:
                return JsonResponse({"error": "Mật khẩu cũ không đúng"}, status=401)

            # Cập nhật mật khẩu mới
            user.password_hash = new_password
            user.save()

            return JsonResponse({"message": "Đổi mật khẩu thành công"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def send_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email không hợp lệ"}, status=400)

            otp_code = str(random.randint(100000, 999999))

            # Lưu OTP vào cache, hết hạn sau 5 phút
            cache.set(f"otp:{email}", otp_code, timeout=300)

            # Gửi email
            send_mail(
                subject="Mã xác thực OTP",
                message=f"Mã OTP của bạn là: {otp_code}",
                from_email="danghieu19022004@gmail.com",  # thay bằng email thật
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP đã được gửi tới email"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def verify_otp(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            otp = data.get("otp")
            phone = data.get("phone")
            password = data.get("password")
            full_name = data.get("full_name", "")

            if not email or not otp or not phone or not password:
                return JsonResponse({"error": "Thiếu thông tin"}, status=400)

            cached_otp = cache.get(f"otp:{email}")

            if cached_otp and cached_otp == otp:
                cache.delete(f"otp:{email}")  # Xóa OTP sau khi dùng

                if User.objects.filter(email=email).exists():
                    return JsonResponse({"error": "Email đã tồn tại"}, status=409)
                if User.objects.filter(phone=phone).exists():
                    return JsonResponse({"error": "Số điện thoại đã tồn tại"}, status=409)

                uid = f"user_{int(datetime.utcnow().timestamp())}"
                current_timestamp = int(datetime.utcnow().timestamp())

                user = User.objects.create(
                    uid=uid,
                    full_name=full_name,
                    email=email,
                    phone=phone,
                    password_hash=password,
                    avatar="",
                    fingerprint="",
                    created_at=current_timestamp,
                    last_sign_in_time=current_timestamp,
                )

                payload = {
                    "user_id": user.uid,
                    "exp": current_timestamp + (30 * 24 * 60 * 60),
                    "iat": current_timestamp,
                }
                jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

                return JsonResponse({
                    "message": "Xác minh OTP và đăng ký thành công",
                    "access_token": jwt_token,
                    "user": {
                        "uid": user.uid,
                        "full_name": user.full_name,
                        "email": user.email,
                        "phone": user.phone,
                        "avatar": user.avatar,
                    }
                })
            else:
                return JsonResponse({"success": False, "error": "Mã OTP không đúng hoặc đã hết hạn"}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Phương thức không hợp lệ"}, status=405)

@csrf_exempt
def facebook_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            uid = data.get("uid")
            full_name = data.get("displayName", "")
            avatar = data.get("photoURL", "")

            if not uid or not full_name or not avatar:
                return JsonResponse({"error": "Missing user data"}, status=400)

            # Chuyển đổi datetime thành timestamp (số nguyên)
            current_timestamp = int(datetime.utcnow().timestamp())

            # Lưu vào MongoDB
            user, created = User.objects.update_or_create(
                uid=uid,
                defaults={
                    "full_name": full_name,
                    "avatar": avatar,
                    "email": "",
                    "phone": "",
                    "password_hash": "",
                    "fingerprint": "",
                    "created_at": current_timestamp,  # Dùng timestamp thay vì datetime
                    "last_sign_in_time": current_timestamp,
                }
            )

            # Tạo JWT token để duy trì đăng nhập
            payload = {
                "user_id": user.uid,
                "exp": current_timestamp + (30 * 24 * 60 * 60),  # Token hết hạn sau 30 ngày
                "iat": current_timestamp,
            }
            jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "Facebook user authenticated successfully",
                "access_token": jwt_token,
                "user": {
                    "uid": user.uid,
                    "full_name": user.full_name,
                    "avatar": user.avatar,
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

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
def form_register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            full_name = data.get("full_name", "")
            email = data.get("email", "")
            phone = data.get("phone", "")
            password = data.get("password", "")

            if not email or not phone or not password:
                return JsonResponse({"error": "Thiếu thông tin đăng ký"}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email đã được sử dụng"}, status=409)
            if User.objects.filter(phone=phone).exists():
                return JsonResponse({"error": "Số điện thoại đã được sử dụng"}, status=409)

            uid = f"user_{int(datetime.utcnow().timestamp())}"

            current_timestamp = int(datetime.utcnow().timestamp())

            user = User.objects.create(
                uid=uid,
                full_name=full_name,
                email=email,
                phone=phone,
                password_hash=password,  # lưu plain text tạm thời (nên hash bằng bcrypt sau này)
                avatar="",
                fingerprint="",
                created_at=current_timestamp,
                last_sign_in_time=current_timestamp,
            )

            payload = {
                "user_id": user.uid,
                "exp": current_timestamp + (30 * 24 * 60 * 60),
                "iat": current_timestamp,
            }
            jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "Đăng ký thành công",
                "access_token": jwt_token,
                "user": {
                    "uid": user.uid,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                }
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def form_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email_or_phone = data.get("id")
            password = data.get("password")

            if not email_or_phone or not password:
                return JsonResponse({"error": "Thiếu thông tin đăng nhập"}, status=400)

            # Tìm user bằng email hoặc SĐT
            try:
                user = User.objects.get(email=email_or_phone)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(phone=email_or_phone)
                except User.DoesNotExist:
                    return JsonResponse({"error": "Không tìm thấy người dùng"}, status=404)

            # So sánh password (giả định đang lưu plain text hoặc hash đã biết)
            if user.password_hash != password:
                return JsonResponse({"error": "Sai mật khẩu"}, status=401)

            # Tạo JWT token
            payload = {
                "user_id": user.uid,
                "exp": datetime.utcnow() + timedelta(days=30),
                "iat": datetime.utcnow(),
            }
            jwt_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "Đăng nhập thành công",
                "access_token": jwt_token,
                "user": {
                    "uid": user.uid,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "avatar": user.avatar,
                }
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def verify_token(request):
    if request.method == "POST":
        try:
            if not request.body:
                return JsonResponse({"error": "Empty request body"}, status=400)

            auth_header = request.headers.get("Authorization")

            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                try:
                    decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                    user = User.objects.get(uid=decoded_token["user_id"])
                    return JsonResponse({
                        "message": "Google User authenticated",
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

            elif auth_header.startswith("Facebook "):
                fb_uid = auth_header.split(" ")[1]
                try:
                    decoded_token = jwt.decode(fb_uid, SECRET_KEY, algorithms=["HS256"])
                    user = User.objects.get(uid=decoded_token["user_id"])
                    return JsonResponse({
                        "message": "Facebook User authenticated",
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

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            logger.error(f"Error in verify_token: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)
