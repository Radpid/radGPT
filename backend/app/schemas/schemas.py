from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ComorbidityBase(BaseModel):
    name: str

class Comorbidity(ComorbidityBase):
    id: int
    
    class Config:
        from_attributes = True

class ReportBase(BaseModel):
    type: str
    title: str
    date: str
    doctor: str
    summary: Optional[str] = None
    full_text: Optional[str] = None

class ReportCreate(ReportBase):
    patient_id: str

class Report(ReportBase):
    id: str
    patient_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    id: str
    last_name: str
    first_name: str
    birth_date: str
    primary_condition: Optional[str] = None
    current_status: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    created_at: datetime
    reports: List[Report] = []
    comorbidities: List[Comorbidity] = []
    
    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    patient_id: str
    sender: str
    message: str

class ChatMessage(ChatMessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DateFilter(BaseModel):
    startDate: str
    endDate: str

class ChatRequest(BaseModel):
    message: str
    patient_id: str
    date_filter: Optional[DateFilter] = None

class ChatResponse(BaseModel):
    response: str
    message_id: int
