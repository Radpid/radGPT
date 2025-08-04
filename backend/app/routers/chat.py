from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models.database import Patient, ChatMessage, User
from ..schemas.schemas import ChatRequest, ChatResponse, ChatMessage as ChatMessageSchema
from ..services.gemini_service import GeminiService
from ..routers.auth import get_current_user
from typing import List
import time

router = APIRouter(prefix="/chat", tags=["chat"])
gemini_service = GeminiService()

@router.post("/general", response_model=ChatResponse)
async def chat_general(
    chat_request: dict,  # {"message": "question"}
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message = chat_request.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        # Obtenir la réponse de Gemini pour requête générale
        ai_response = await gemini_service.get_general_query(message, db)
        
        # Créer un ID temporaire pour la réponse
        message_id = int(time.time() * 1000)
        
        return ChatResponse(response=ai_response, message_id=message_id)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing general chat request: {str(e)}")

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que le patient existe
    patient = db.query(Patient).options(
        joinedload(Patient.reports),
        joinedload(Patient.comorbidities)
    ).filter(Patient.id == chat_request.patient_id).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Sauvegarder le message de l'utilisateur
    user_message = ChatMessage(
        patient_id=chat_request.patient_id,
        sender="user",
        message=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    try:
        # Préparer le filtre de date s'il existe
        date_filter = None
        if chat_request.date_filter:
            date_filter = {
                'startDate': chat_request.date_filter.startDate,
                'endDate': chat_request.date_filter.endDate
            }
        
        # Obtenir la réponse de Gemini
        ai_response = await gemini_service.get_patient_analysis(patient, chat_request.message, date_filter)
        
        # Sauvegarder la réponse de l'IA
        ai_message = ChatMessage(
            patient_id=chat_request.patient_id,
            sender="ai",
            message=ai_response
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return ChatResponse(response=ai_response, message_id=ai_message.id)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@router.get("/{patient_id}/history", response_model=List[ChatMessageSchema])
def get_chat_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que le patient existe
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Récupérer l'historique des messages
    messages = db.query(ChatMessage).filter(
        ChatMessage.patient_id == patient_id
    ).order_by(ChatMessage.created_at).all()
    
    return messages

@router.delete("/{patient_id}/history")
def clear_chat_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que le patient existe
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Supprimer tous les messages pour ce patient
    deleted_count = db.query(ChatMessage).filter(
        ChatMessage.patient_id == patient_id
    ).delete()
    
    db.commit()
    
    return {"message": f"Deleted {deleted_count} messages", "deleted_count": deleted_count}
