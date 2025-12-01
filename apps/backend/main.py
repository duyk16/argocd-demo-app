from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
import logging
from prometheus_fastapi_instrumentator import Instrumentator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GaaS Backend Orchestrator")

# Instrument Prometheus
Instrumentator().instrument(app).expose(app)

# Service endpoints
SERVICES = {
    "toxic": {
        "cpu": os.getenv("TOXIC_CPU_URL", "http://toxic-cpu-service:8000"),
        "gpu": os.getenv("TOXIC_GPU_URL", "http://toxic-gpu-service:8000"),
    },
    "prompt-injection": {
        "cpu": os.getenv("PROMPT_INJ_CPU_URL", "http://prompt-injection-cpu-service:8000"),
        "gpu": os.getenv("PROMPT_INJ_GPU_URL", "http://prompt-injection-gpu-service:8000"),
    }
}

class CheckRequest(BaseModel):
    text: str
    guardrail: str  # "toxic" or "prompt-injection"
    version: str = "cpu"  # "cpu" or "gpu"

class CheckResponse(BaseModel):
    guardrail: str
    version: str
    score: float
    flagged: bool
    details: dict

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "orchestrator"}

@app.post("/check", response_model=CheckResponse)
async def check_guardrail(request: CheckRequest):
    try:
        # Validate inputs
        if request.guardrail not in SERVICES:
            raise HTTPException(status_code=400, detail=f"Invalid guardrail: {request.guardrail}")
        if request.version not in ["cpu", "gpu"]:
            raise HTTPException(status_code=400, detail=f"Invalid version: {request.version}")
        
        # Get service URL
        service_url = SERVICES[request.guardrail][request.version]
        
        # Call model service
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{service_url}/predict",
                json={"text": request.text}
            )
            response.raise_for_status()
            result = response.json()
        
        # Format response
        flagged = result.get("is_toxic") or result.get("is_injection", False)
        
        return CheckResponse(
            guardrail=request.guardrail,
            version=request.version,
            score=result["score"],
            flagged=flagged,
            details=result
        )
    except httpx.HTTPError as e:
        logger.error(f"HTTP error calling model service: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Model service unavailable: {str(e)}")
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
