import cv2
from ultralytics import YOLO

from ocr.ocr_script import extract_text

model = YOLO('./runs/train/yolov8_model9/weights/best.onnx')


def visualize_predictions(image, coords):
    for (x1, y1, x2, y2) in coords:
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.imshow("Predictions", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def process_image(image_path):
    image = cv2.imread(image_path)
    results = model.predict(image, conf=0.2, iou=0.5)
    detections = results[0].boxes.xyxy
    coords = [(int(x1), int(y1), int(x2), int(y2)) for x1, y1, x2, y2 in detections]
    visualize_predictions(image, coords)
    texts = extract_text(image, coords)
    return texts

# Chạy thử nghiệm
image_path = 'E:/ORC_mobile_app/traindetect/data/images/train/3c236316-afaa-42bb-9f19-97231ccc2034.jpg'
texts = process_image(image_path)

print("Extracted Texts:", texts)
