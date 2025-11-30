from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Toxic Comment Detection Service")

# Global model variable
model = None
MODEL_NAME = "martin-ha/toxic-comment-model"
MODEL_CACHE_DIR = "/models"
SERVICE_TYPE = os.getenv("SERVICE_TYPE", "cpu")  # cpu or gpu

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    score: float
    is_toxic: bool
    model: str

def load_model():
    """Load model from cache directory"""
    global model
    if model is None:
        logger.info(f"Loading model from {MODEL_CACHE_DIR}...")
        device = 0 if SERVICE_TYPE == "gpu" else -1  # 0 for GPU, -1 for CPU
        model = pipeline(
            "text-classification",
            model=MODEL_NAME,
            cache_dir=MODEL_CACHE_DIR,
            device=device
        )
        logger.info("Model loaded successfully")
    return model

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": f"toxic-{SERVICE_TYPE}"}

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        # Load model on first request
        classifier = load_model()
        
        # Run prediction
        result = classifier(request.text)[0]
        
        # Extract score (assuming label "toxic" or similar)
        score = result['score'] if result['label'] == 'toxic' else 1 - result['score']
        
        return PredictResponse(
            score=round(score, 4),
            is_toxic=score > 0.5,
            model=f"toxic-{SERVICE_TYPE}"
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
