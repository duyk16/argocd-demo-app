from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Prompt Injection Detection Service")

model = None
MODEL_NAME = "protectai/deberta-v3-base-prompt-injection"
MODEL_CACHE_DIR = "/models"
SERVICE_TYPE = os.getenv("SERVICE_TYPE", "cpu")

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    score: float
    is_injection: bool
    model: str

def load_model():
    global model
    if model is None:
        logger.info(f"Loading model from {MODEL_CACHE_DIR}...")
        device = 0 if SERVICE_TYPE == "gpu" else -1
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
    return {"status": "healthy", "service": f"prompt-injection-{SERVICE_TYPE}"}

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        classifier = load_model()
        result = classifier(request.text)[0]
        score = result['score'] if result['label'] == 'INJECTION' else 1 - result['score']
        
        return PredictResponse(
            score=round(score, 4),
            is_injection=score > 0.5,
            model=f"prompt-injection-{SERVICE_TYPE}"
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
