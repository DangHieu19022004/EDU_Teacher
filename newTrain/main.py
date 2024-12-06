import cv2
import matplotlib.pyplot as plt
from ocr.ocr_script import extract_text
from ultralytics import YOLO

model = YOLO('E:/ORC_mobile_app/newTrain/runs/train/yolov8_model/weights/best.onnx')


def visualize_predictions(image, coords):
    for (x1, y1, x2, y2) in coords:
        print(f"Bounding box: ({x1}, {y1}), ({x2}, {y2})")
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
   # Hiển thị ảnh bằng matplotlib
    plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    plt.title("Predictions")
    plt.axis("off")
    plt.show()

def process_image(image_path):
    image = cv2.imread(image_path)
    results = model.predict(image, conf=0.2, iou=0.5)

    detections = results[0].boxes.xyxy.cpu().numpy()
    coords = [(int(x1), int(y1), int(x2), int(y2)) for x1, y1, x2, y2 in detections]

    visualize_predictions(image.copy(), coords)

    texts = extract_text(image, coords)
    return texts

# Chạy thử nghiệm
image_path = 'E:/ORC_mobile_app/traindetect/data/images/train/12ff4c39-fd49-4317-8b46-8ee531359b0d.jpg'
texts = process_image(image_path)

print("Extracted Texts:")
for text, confidence in texts:
    print(f"Text: {text}, Confidence: {confidence:.2f}")
