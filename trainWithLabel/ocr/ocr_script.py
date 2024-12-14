import re

import cv2
import pytesseract
from paddleocr import PaddleOCR

ocr = PaddleOCR(lang='en',  drop_score=0.1, use_angle_cls=True)

def extract_text(image):
    labels = {
        0: "batch",
        1: "cardnumber",
        2: "cost",
        3: "datetime",
        4: "namecustomer",
        5: "namemerchine",
        6: "typecard"
    }

    extracted_data = {label: None for label in labels.values()}  # Khởi tạo dictionary cho các nhãn

    # Nhận diện văn bản
    result = ocr.ocr(image, cls=True)
    if not result or not result[0]:
        print(f"OCR không nhận diện được văn bản")
        return extracted_data

    # # Hiển thị kết quả OCR ban đầu
    # print("Kết quả OCR gốc:")
    # for line in result[0]:
    #     print(line)

    # Tiền xử lý để nhóm các hộp giới hạn trên cùng một hàng
    lines = sorted(result[0], key=lambda x: x[0][0][1])  # Sắp xếp theo tọa độ y
    grouped_lines = []  # Danh sách các nhóm hàng
    current_group = []
    current_y = lines[0][0][0][1]  # Tọa độ y của từ đầu tiên
    max_y_gap = 15  # Ngưỡng sai lệch dọc giữa các từ (pixel)

    for line in lines:
        box, (detected_text, confidence) = line
        x1, y1, x2, y2 = box[0][0], box[0][1], box[2][0], box[2][1]
        if abs(y1 - current_y) < max_y_gap:  # Cùng hàng nếu khoảng cách y nhỏ hơn ngưỡng
            current_group.append((detected_text, confidence, x1))
        else:
            # Sắp xếp nhóm hiện tại theo tọa độ x
            current_group = sorted(current_group, key=lambda x: x[2])
            grouped_lines.append(current_group)
            current_group = [(detected_text, confidence, x1)]
            current_y = y1

    # Thêm nhóm cuối cùng
    if current_group:
        grouped_lines.append(current_group)

    # Gộp các từ trên cùng một hàng
    texts = []
    for group in grouped_lines:
        full_text = " ".join([text for text, _, _ in group])
        confidence = min([conf for _, conf, _ in group])  # Độ tin cậy thấp nhất trong nhóm
        texts.append((full_text, confidence))


    # Phân loại thông tin dựa trên từ khóa
    for detected_text, confidence in texts:
        if any(keyword in detected_text.lower() for keyword in ["batch", "SO LO 000", "SOLO 000", "solo", "so lo", "batch number"]):
            extracted_data["batch"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["cardnumber", "********", "*******-****-", "****-****-****-"]):
            extracted_data["cardnumber"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["total", "cost", "amount", "TONG CONG", "tong cong"]):
            extracted_data["cost"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["date", "time", "ngay", "gio", "GIO"]):
            extracted_data["datetime"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["ten", "name", "ONG"]):
            extracted_data["namecustomer"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["TEN", "TEN DAI LY", "TEN DAI", "DIA CHI"]):
            extracted_data["namemerchine"] = detected_text
        elif any(keyword in detected_text.lower() for keyword in ["THE", "CARD", "LOAI THE", "the", "L.THE"]):
            extracted_data["typecard"] = detected_text

    return extracted_data



# def extract_text(image):
#     texts = []
#     # Thử nghiệm OCR
#     result = ocr.ocr(image, cls=True)  # Nhận diện văn bản
#     if not result or not result[0]:
#         print(f"OCR không nhận diện được văn bản")
#         return texts

#     # Tiền xử lý để nhóm các hộp giới hạn gần nhau
#     grouped_texts = []
#     if result and result[0]:
#         # Sắp xếp theo tọa độ y (sử dụng cạnh trên của hộp)
#         lines = sorted(result[0], key=lambda x: x[0][0][1])
#         current_group = []
#         current_y = lines[0][0][0][1]  # Lấy tọa độ y của góc trên cùng bên trái
#         last_x2 = lines[0][0][2][0]

#         for line in lines:
#             box, (detected_text, confidence) = line
#             x1, y1, x2, y2 = box[0][0], box[0][1], box[2][0], box[2][1]
#             if abs(y1 - current_y) < 15  and (x1 - last_x2) < 500: # Ngưỡng khoảng cách dọc (pixel)
#                 current_group.append((detected_text, confidence))
#             else:
#                 grouped_texts.append(current_group)
#                 current_group = [(detected_text, confidence)]
#                 current_y = y1
#                 last_x2 = x2
#         if current_group:
#             grouped_texts.append(current_group)

#     # Gộp nội dung từng nhóm thành một dòng văn bản
#     for group in grouped_texts:
#         full_text = " ".join([text for text, _ in group])
#         confidence = min([conf for _, conf in group])  # Chọn độ tin cậy thấp nhất trong nhóm
#         texts.append((full_text, confidence))

#     return texts


############################################################################################

# def extract_text(image):
#     labels = {
#         0: "batch",
#         1: "cardnumber",
#         2: "cost",
#         3: "datetime",
#         4: "namecustomer",
#         5: "namemerchine",
#         6: "typecard"
#     }

#     texts = []
#     extracted_data = {label: None for label in labels.values()}

#     # Thử nghiệm OCR
#     result = ocr.ocr(image, cls=True)  # Nhận diện văn bản
#     if not result or not result[0]:
#         print(f"OCR không nhận diện được văn bản")
#         return extracted_data

#     # Tiền xử lý để nhóm các hộp giới hạn gần nhau
#     grouped_texts = []
#     if result and result[0]:
#         # Sắp xếp theo tọa độ y (sử dụng cạnh trên của hộp)
#         lines = sorted(result[0], key=lambda x: x[0][0][1])
#         current_group = []
#         current_y = lines[0][0][0][1]  # Lấy tọa độ y của góc trên cùng bên trái

#         for line in lines:
#             box, (detected_text, confidence) = line
#             y = box[0][1]  # Lấy tọa độ y của góc trên cùng bên trái
#             if abs(y - current_y) < 15:  # Ngưỡng khoảng cách dọc (pixel)
#                 current_group.append((detected_text, confidence))
#             else:
#                 grouped_texts.append(current_group)
#                 current_group = [(detected_text, confidence)]
#                 current_y = y
#         if current_group:
#             grouped_texts.append(current_group)

#     # Gộp nội dung từng nhóm thành một dòng văn bản
#     for group in grouped_texts:
#         full_text = " ".join([text for text, _ in group])
#         confidence = min([conf for _, conf in group])  # Chọn độ tin cậy thấp nhất trong nhóm
#         texts.append((full_text, confidence))


#     # texts = []
#     # # Thử nghiệm OCR
#     # result = ocr.ocr(image, cls=True)  # Nhận diện văn bản
#     # if not result or not result[0]:
#     #     print(f"OCR không nhận diện được văn bản")
#     # for line in result[0]:  # Duyệt qua các kết quả OCR
#     #     detected_text = line[1][0]  # Văn bản nhận diện được
#     #     confidence = line[1][1]    # Độ tin cậy của kết quả
#     #     texts.append((detected_text, confidence))


#     # for (x1, y1, x2, y2) in coords:

#     #     cropped_image = image[y1:y2, x1:x2]  # Cắt vùng bounding box
#     #     if x1 < 0 or y1 < 0 or x2 > image.shape[1] or y2 > image.shape[0]:
#     #         print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
#     #         continue
#     #      # Cắt và chuyển đổi định dạng ảnh
#     #     cropped_image = image[y1:y2, x1:x2]
#     #     if cropped_image.size == 0:
#     #         print(f"Vùng ảnh rỗng tại: ({x1}, {y1}, {x2}, {y2})")
#     #         continue

#     #     cropped_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
#     #     cropped_image = cv2.GaussianBlur(cropped_image, (3, 3), 0)
#     #     cropped_image = cv2.adaptiveThreshold(cropped_image, 255,
#     #                                         cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#     #                                         cv2.THRESH_BINARY, 11, 2)


#     #     # Thử nghiệm OCR
#     #     result = ocr.ocr(cropped_image, cls=True)  # Nhận diện văn bản
#     #     if not result or not result[0]:
#     #         print(f"OCR không nhận diện được văn bản tại vùng ({x1}, {y1}, {x2}, {y2})")
#     #         continue


#     #     for line in result[0]:  # Duyệt qua các kết quả OCR
#     #         detected_text = line[1][0]  # Văn bản nhận diện được
#     #         confidence = line[1][1]    # Độ tin cậy của kết quả
#     #         texts.append((detected_text, confidence))

#     # return texts

