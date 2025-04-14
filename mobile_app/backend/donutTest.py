from transformers import VisionEncoderDecoderModel, DonutProcessor
from PIL import Image
import torch

# Load mô hình Donut OCR
processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base")
model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Load ảnh học bạ
image_path = "E:/Download/1.jpg"  # ← Đường dẫn ảnh
image = Image.open(image_path).convert("RGB")
pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)

# Prompt mặc định để OCR toàn bộ nội dung
prompt = "<s><s_text>"
decoder_input_ids = processor.tokenizer(prompt, add_special_tokens=False, return_tensors="pt").input_ids
decoder_input_ids = decoder_input_ids.to(device)

# Dự đoán
outputs = model.generate(
    pixel_values,
    decoder_input_ids=decoder_input_ids,
    max_length=1024,
    early_stopping=True,
    pad_token_id=processor.tokenizer.pad_token_id,
    eos_token_id=processor.tokenizer.eos_token_id,
    use_cache=True,
    num_beams=1,
)

# Kết quả
output_text = processor.batch_decode(outputs, skip_special_tokens=True)[0]
output_text = output_text.replace("<s_text>", "").replace("</s>", "").strip()

print("\n🧾 KẾT QUẢ OCR:")
print(output_text)
