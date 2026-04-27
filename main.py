import io
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO
import numpy as np

# 1. Initialize FastAPI
app = FastAPI(title="Hoverscan AI Backend", description="YOLOv8 Inference API for Bridge Defects")

# 2. Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

# 3. Load YOLOv8 Model
# Ensure 'best.pt' is in the same directory as this file
# Change this path to the location of your Roboflow weights
model_path = r"C:\Users\user\Desktop\HoverScan\Hoverscan websiteee\backend\best.pt"

try:
    model = YOLO(model_path)
    print(f"Custom Roboflow model loaded from {model_path}")
except Exception as e:
    print(f"Error loading custom model: {e}. Falling back to default.")
    model = YOLO("yolov8n.pt")

# From your data.yaml: 
# ['bridge joint', 'crack', 'mold', 'peeling', 'potholes', 'road bleeding', 
# 'rust', 'spalling', 'spalling expose rebar', 'staining', 'vegetation']

@app.get("/")
async def root():
    return {"status": "online", "model": "YOLOv8-Bridge-Damage-v6"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Receives an image, runs YOLOv8 inference, 
    and returns the defect with the highest confidence rate.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image bytes
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        # Run Inference
        results = model.predict(source=image, conf=0.45, save=False)
        
        detections = []
        for r in results:
            for box in r.boxes:
                coords = box.xyxyn[0].tolist() # MUST BE xyxyn
                detections.append({
                    "type": model.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": coords, # Now sends [xmin, ymin, xmax, ymax] as 0-1
                    "severity": "High" if float(box.conf[0]) > 0.8 else "Low"
                })

        # Logic for "Analysis Section": Only show highest rate
        if not detections:
            return {"message": "No defects detected", "highest_defect": None, "all_detections": []}

        # Sort by confidence descending
        detections.sort(key=lambda x: x["confidence"], reverse=True)
        highest_defect = detections[0]

        return {
            "highest_defect": highest_defect,
            "count": len(detections),
            "all_detections": detections # Optional: include all for the 'Defects' tab
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run server: python main.py
    uvicorn.run(app, host="0.0.0.0", port=8000)