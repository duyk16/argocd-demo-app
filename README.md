# GaaS - Guardrail as a Service

A production-ready guardrail service with 4 model inference services, backend orchestrator, and Next.js playground.

## Architecture

- **Model Services** (4): toxic/prompt-injection × CPU/GPU
- **Backend**: FastAPI orchestrator
- **Frontend**: Next.js playground

## Quick Start

```bash
# Deploy via ArgoCD
kubectl apply -f k8s/argocd-app.yaml

# Check status
kubectl get pods
```

## Services

- `toxic-cpu-service:8000` - Toxic detection (CPU)
- `toxic-gpu-service:8000` - Toxic detection (GPU)
- `prompt-injection-cpu-service:8000` - Prompt injection detection (CPU)
- `prompt-injection-gpu-service:8000` - Prompt injection detection (GPU)
- `backend-service:8000` - Orchestrator API
