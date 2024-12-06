import cv2
import pytesseract
from paddleocr import PaddleOCR

ocr = PaddleOCR(lang='en',  drop_score=0.2, use_angle_cls=True)

def extract_text(image, coords):


    texts = []
    for (x1, y1, x2, y2) in coords:

        cropped_image = image[y1:y2, x1:x2]  # Cắt vùng bounding box
        if x1 < 0 or y1 < 0 or x2 > image.shape[1] or y2 > image.shape[0]:
            print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
            continue
         # Cắt và chuyển đổi định dạng ảnh
        cropped_image = image[y1:y2, x1:x2]
        if cropped_image.size == 0:
            print(f"Vùng ảnh rỗng tại: ({x1}, {y1}, {x2}, {y2})")
            continue

        cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
        cropped_image = cv2.GaussianBlur(cropped_image, (3, 3), 0)
        cropped_image = cv2.adaptiveThreshold(cropped_image, 255,
                                            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY, 11, 2)


        # Thử nghiệm OCR
        result = ocr.ocr(cropped_image, cls=True)  # Nhận diện văn bản
        if not result or not result[0]:
            print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
            continue


        for line in result[0]:  # Duyệt qua các kết quả OCR
            detected_text = line[1][0]  # Văn bản nhận diện được
            confidence = line[1][1]    # Độ tin cậy của kết quả
            texts.append((detected_text, confidence))

    return texts

