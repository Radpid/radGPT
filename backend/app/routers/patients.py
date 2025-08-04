from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models.database import Patient, Report, Comorbidity
from ..schemas.schemas import Patient as PatientSchema, PatientCreate, Report as ReportSchema
from ..routers.auth import get_current_user
from ..models.database import User

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/", response_model=List[PatientSchema])
def get_patients(
    skip: int = 0, 
    limit: int = 100, 
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Patient).options(
        joinedload(Patient.reports),
        joinedload(Patient.comorbidities)
    )
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_filter)) |
            (Patient.last_name.ilike(search_filter)) |
            (Patient.id.ilike(search_filter))
        )
    
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientSchema)
def get_patient(
    patient_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).options(
        joinedload(Patient.reports),
        joinedload(Patient.comorbidities)
    ).filter(Patient.id == patient_id).first()
    
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/", response_model=PatientSchema)
def create_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier si le patient existe déjà
    existing_patient = db.query(Patient).filter(Patient.id == patient.id).first()
    if existing_patient:
        raise HTTPException(status_code=400, detail="Patient with this ID already exists")
    
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/{patient_id}/reports", response_model=List[ReportSchema])
def get_patient_reports(
    patient_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    reports = db.query(Report).filter(Report.patient_id == patient_id).all()
    return reports
