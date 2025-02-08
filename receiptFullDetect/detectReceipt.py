import base64
import os
import uuid

import cv2
import requests

# Thông tin Roboflow API
ROBOFLOW_MODEL_ID = "receipt-csbkt"
ROBOFLOW_VERSION = "1"
API_KEY = "KZ3A1AoFtouR6PWOO5O4"

# URL API inference của Roboflow
url = f"https://detect.roboflow.com/{ROBOFLOW_MODEL_ID}/{ROBOFLOW_VERSION}?api_key={API_KEY}"

def save_base64_to_image(base64_string, output_path="temp_image.jpg"):
    """Giải mã Base64 và lưu thành file ảnh"""
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]  # Bỏ tiền tố data:image/jpeg;base64,

        image_data = base64.b64decode(base64_string)

        with open(output_path, "wb") as f:
            f.write(image_data)

        print(f"✅ Ảnh đã được lưu thành công: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Lỗi khi lưu ảnh: {e}")
        return None

def binary_to_base64(binary_data):
    """
    Chuyển dữ liệu nhị phân (binary) từ MongoDB thành chuỗi Base64.
    """
    if not isinstance(binary_data, bytes):
        raise TypeError("Dữ liệu đầu vào phải là bytes!")

    base64_encoded = base64.b64encode(binary_data).decode('utf-8')
    return base64_encoded

def predict_from_image(image_path):
    """Gửi ảnh lên API dưới dạng multipart/form-data"""
    try:
        with open(image_path, "rb") as image_file:
            files = {"file": image_file}
            response = requests.post(url, files=files)

        if response.status_code == 200:
            predictions = response.json()
            return predictions
        else:
            print(f"❌ Lỗi API: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Lỗi khi gửi ảnh lên API: {e}")
        return None

def crop_and_save(image_path, predictions, confidence_threshold=0.7, output_folder="cropped_images"):
    """Cắt và lưu ảnh theo vùng bounding box có confidence > 0.7"""
    image = cv2.imread(image_path)

    if image is None:
        print("❌ Không thể đọc file ảnh! Kiểm tra lại đường dẫn hoặc định dạng ảnh.")
        return

    height, width, _ = image.shape

    # Lọc các bounding boxes có confidence > threshold
    filtered_predictions = [pred for pred in predictions["predictions"] if pred["confidence"] > confidence_threshold]

    if not filtered_predictions:
        print("⚠️ Không có đối tượng nào vượt quá ngưỡng confidence!")
        return

    # Tạo thư mục output nếu chưa có
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    cropped_images = []

    for idx, pred in enumerate(filtered_predictions):
        x, y, w, h = int(pred["x"]), int(pred["y"]), int(pred["width"]), int(pred["height"])
        label = pred["class"]
        confidence = pred["confidence"]

        # Chuyển tọa độ về góc trên trái và dưới phải
        x1 = max(0, x - w // 2)
        y1 = max(0, y - h // 2)
        x2 = min(width, x + w // 2)
        y2 = min(height, y + h // 2)

        # Cắt ảnh
        cropped_img = image[y1:y2, x1:x2]

        # Lưu ảnh
        cropped_filename = f"{output_folder}/{label}_{idx}.jpg"
        cv2.imwrite(cropped_filename, cropped_img)
        cropped_images.append(cropped_filename)
        print(f"✅ Đã lưu ảnh cắt: {cropped_filename}")

    return cropped_images

# # 🚀 Chọn ảnh từ thiết bị
# image_path = r"E:\ORC_mobile_app\image_receipt\e.jpg"  # Sử dụng r"" để tránh lỗi đường dẫn Windows
# image = cv2.imread(image_path)

# if image is None:
#     print("❌ Không thể đọc file ảnh! Kiểm tra lại đường dẫn hoặc định dạng ảnh.")
# else:
#     print("✅ Ảnh hợp lệ, tiếp tục xử lý...")

base64_data = ""

base64_data = binary_to_base64(base64_data)

# 🔹 Lưu Base64 thành file ảnh tạm
image_path = f"temp_{uuid.uuid4()}.jpg"  # Tạo tên file tạm không trùng lặp
image_path = save_base64_to_image(base64_data, image_path)

if image_path:
    # Gửi ảnh lên API
    predictions = predict_from_image(image_path)

    # 🔹 Hiển thị kết quả
    if predictions:
        print("✅ Dự đoán thành công!", predictions)
        cropped_images = crop_and_save(image_path, predictions)
        if cropped_images:
            print("🖼️ Ảnh đã được cắt và lưu thành công:", cropped_images)

    # 🔹 Xóa file ảnh tạm sau khi xử lý xong (nếu cần)
    if os.path.exists(image_path):
        os.remove(image_path)
        print(f"🗑️ Đã xóa ảnh tạm: {image_path}")

# predictions = predict_from_image(image_path)
# # # Cắt vùng bounding box nếu có kết quả hợp lệ
# if predictions:
#     print("✅ Dự đoán thành công!")
#     cropped_images = crop_and_save(image_path, predictions)

#     if cropped_images:
#         print("🖼️ Ảnh đã được cắt và lưu thành công:", cropped_images)
