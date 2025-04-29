from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from ultralytics import YOLO
import os
from typing import List, Dict
import base64
import stripe
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Parking Spot Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "your_stripe_secret_key")

# Load YOLO model for vehicle detection
try:
    model = YOLO('yolov8n.pt')
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Error loading YOLO model: {str(e)}")
    raise

# Parking lot configuration
PARKING_LOT_CONFIG = {
    "total_spots": 50,
    "rows": 5,
    "columns": 10,
    "spot_width": 100,
    "spot_height": 200,
    "hourly_rate": 5.00
}

class PaymentIntentRequest(BaseModel):
    amount: int
    spot_id: str

class SpotDetectionRequest(BaseModel):
    image: str
    lot_id: str

@app.get("/")
async def root():
    return {"message": "Welcome to Parking Spot Detection API"}

@app.post("/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    try:
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency="usd",
            automatic_payment_methods={
                "enabled": True,
            },
            metadata={
                "spot_id": request.spot_id
            }
        )
        
        return JSONResponse({
            "clientSecret": intent.client_secret
        })
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return JSONResponse({
            "error": str(e)
        }, status_code=400)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return JSONResponse({
            "error": str(e)
        }, status_code=500)

@app.post("/detect-spots")
async def detect_spots(request: SpotDetectionRequest):
    try:
        # Validate image data
        if not request.image:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(request.image.split(',')[1])
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise HTTPException(status_code=400, detail="Invalid image data")
        except Exception as e:
            logger.error(f"Image decoding error: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run YOLO detection
        try:
            results = model(img)
        except Exception as e:
            logger.error(f"YOLO detection error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error during vehicle detection")
        
        # Process results for vehicle detection
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = box.conf[0].cpu().numpy()
                class_id = box.cls[0].cpu().numpy()
                
                # Filter for vehicles (car, truck, motorcycle)
                if confidence > 0.5 and class_id in [2, 7, 3]:  # COCO class IDs for vehicles
                    detections.append({
                        "bbox": [float(x1), float(y1), float(x2), float(y2)],
                        "confidence": float(confidence),
                        "class_id": int(class_id)
                    })
        
        # Process parking spots
        spots = []
        for i in range(PARKING_LOT_CONFIG["rows"]):
            for j in range(PARKING_LOT_CONFIG["columns"]):
                spot_id = f"{i}_{j}"
                x1 = j * PARKING_LOT_CONFIG["spot_width"]
                y1 = i * PARKING_LOT_CONFIG["spot_height"]
                x2 = x1 + PARKING_LOT_CONFIG["spot_width"]
                y2 = y1 + PARKING_LOT_CONFIG["spot_height"]
                
                # Check if spot is occupied
                is_occupied = False
                for detection in detections:
                    dx1, dy1, dx2, dy2 = detection["bbox"]
                    # Simple overlap check
                    if (x1 < dx2 and x2 > dx1 and y1 < dy2 and y2 > dy1):
                        is_occupied = True
                        break
                
                spots.append({
                    "id": spot_id,
                    "bbox": [x1, y1, x2, y2],
                    "occupied": is_occupied
                })
        
        # Convert image to base64 for frontend display
        try:
            _, buffer = cv2.imencode('.jpg', img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
        except Exception as e:
            logger.error(f"Image encoding error: {str(e)}")
            img_base64 = None
        
        return JSONResponse({
            "spots": spots,
            "image": img_base64,
            "total_spots": PARKING_LOT_CONFIG["total_spots"],
            "available_spots": sum(1 for spot in spots if not spot["occupied"]),
            "detections": detections
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in detect_spots: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/parking-lot/main")
async def get_main_parking_lot():
    try:
        return {
            "id": "main",
            "name": "Main Parking Lot",
            "total_spots": PARKING_LOT_CONFIG["total_spots"],
            "hourly_rate": PARKING_LOT_CONFIG["hourly_rate"],
            "rows": PARKING_LOT_CONFIG["rows"],
            "columns": PARKING_LOT_CONFIG["columns"],
            "spot_width": PARKING_LOT_CONFIG["spot_width"],
            "spot_height": PARKING_LOT_CONFIG["spot_height"]
        }
    except Exception as e:
        logger.error(f"Error in get_main_parking_lot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    try:
        port = int(os.getenv("PORT", "8000"))
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise 