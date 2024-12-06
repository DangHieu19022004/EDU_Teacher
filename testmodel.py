import cv2
import numpy as np
import onnxruntime as ort

# Tải mô hình YOLOv8
model_path = r"E:\ORC_mobile_app\mobile_app\backend\models\best.onnx"
session = ort.InferenceSession(model_path)

# Tiền xử lý ảnh
def preprocess_image(image_path, img_size=(640, 640)):
    image = cv2.imread(image_path)
    image = cv2.resize(image, img_size)
    image = image.transpose(2, 0, 1)
    image = np.expand_dims(image, axis=0)
    image = image.astype(np.float32)
    image /= 255.0
    return image

image_path = r'E:/ORC_mobile_app/traindetect/data/images/train/12ff4c39-fd49-4317-8b46-8ee531359b0d.jpg'
input_image = preprocess_image(image_path)

# Lấy tên đầu vào của mô hình
input_name = session.get_inputs()[0].name
outputs = session.run(None, {input_name: input_image})

# In kết quả để kiểm tra
print(outputs)

# Giải mã kết quả (tùy thuộc vào cấu trúc đầu ra của mô hình)
results = outputs[0]  # Giả sử tất cả thông tin nằm trong một phần tử đầu ra

# Các giá trị của bounding box, confidence, class
boxes = results[..., :4]
scores = results[..., 4]
classes = results[..., 5]

# Xử lý các giá trị (ví dụ, vẽ bounding boxes, lọc các dự đoán với confidence cao hơn 0.5)
for box, score, cls in zip(boxes, scores, classes):
    if (scores > 0.5).all():  # Kiểm tra tất cả các giá trị
        print(f"Class: {cls}, Confidence: {score}, Box: {box}")
