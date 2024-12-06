from ultralytics import YOLO

model = YOLO('yolov8n.pt')

model.train(
    data = 'E:/ORC_mobile_app/traindetect/yolov8/config.yaml',
    epochs = 50,
    batch = 16,
    imgsz = 640,
    project = 'runs/train',
    name = 'yolov8_model',
    device = 'cpu'
)

model.export(format = 'onnx')
