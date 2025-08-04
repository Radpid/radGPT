from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import datetime

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime.datetime
    service: str

class MessageRequest(BaseModel):
    message: str
    user_id: str = None

class MessageResponse(BaseModel):
    response: str
    timestamp: datetime.datetime

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.datetime.now(),
        service="radGPT"
    )

@router.post("/chat", response_model=MessageResponse)
async def chat(request: MessageRequest):
    # Logique de chat à implémenter
    return MessageResponse(
        response=f"Réponse automatique à: {request.message}",
        timestamp=datetime.datetime.now()
    )

@router.get("/")
async def root():
    return {"message": "radGPT API v1.0.0", "status": "running"}
