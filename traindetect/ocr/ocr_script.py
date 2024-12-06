import cv2
import pytesseract


def extract_text(image, coords):
    texts = []
    for (x1, y1, x2, y2) in coords:
        roi = image[y1:y2, x1:x2]
        text = pytesseract.image_to_string(
            roi,
            config='--psm 6 -c tessedit_char_whitelist=0123456789,'
        )
        texts.append(text.strip())

    return texts
