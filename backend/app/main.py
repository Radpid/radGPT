from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import create_tables, get_db
from .routers import auth, patients, chat
from .models.database import User, Patient, Report, Comorbidity, patient_comorbidity
from .services.auth import get_password_hash

app = FastAPI(title="RadGPT API", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(chat.router)

@app.on_event("startup")
def startup_event():
    create_tables()
    # Créer des données de test si nécessaire
    create_sample_data()

def create_sample_data():
    """Créer des données d'exemple pour les tests"""
    db = next(get_db())
    
    # Créer un utilisateur de test s'il n'existe pas
    existing_user = db.query(User).filter(User.email == "dr.schmidt@klinik.de").first()
    if not existing_user:
        test_user = User(
            email="dr.schmidt@klinik.de",
            name="Dr. Schmidt",
            hashed_password=get_password_hash("password123")
        )
        db.add(test_user)
    
    # Créer un autre utilisateur avec des credentials simples pour les tests
    existing_admin = db.query(User).filter(User.email == "admin").first()
    if not existing_admin:
        admin_user = User(
            email="admin",
            name="Admin",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin_user)
    
    # Créer des comorbidités
    comorbidities_data = [
        "Périphérale Polyneuropathie Grad 2",
        "Diabetes Mellitus Typ 2",
        "Hypertension artérielle",
        "Insuffisance cardiaque",
        "COPD",
        "Osteoporose",
        "Arthrose",
        "Niereninsuffizienz",
        "Hypercholesterinämie"
    ]
    
    for comorbidity_name in comorbidities_data:
        existing_comorbidity = db.query(Comorbidity).filter(Comorbidity.name == comorbidity_name).first()
        if not existing_comorbidity:
            comorbidity = Comorbidity(name=comorbidity_name)
            db.add(comorbidity)
    
    # Patients multiples avec différentes spécialités
    patients_data = [
        {
            "id": "123456",
            "last_name": "Schmitt",
            "first_name": "Hans",
            "birth_date": "20.05.1958",
            "primary_condition": "Rektumkarzinom (cT3N1M0)",
            "current_status": "Re-Staging vor Ileostoma-Rückverlegung",
            "specialty": "Onkologie",
            "comorbidities": ["Périphérale Polyneuropathie Grad 2", "Diabetes Mellitus Typ 2"]
        },
        {
            "id": "234567",
            "last_name": "Müller",
            "first_name": "Anna",
            "birth_date": "15.03.1965",
            "primary_condition": "Mammakarzinom links (T2N1M0)",
            "current_status": "Adjuvante Chemotherapie laufend",
            "specialty": "Onkologie",
            "comorbidities": ["Hypertension artérielle"]
        },
        {
            "id": "345678",
            "last_name": "Weber",
            "first_name": "Klaus",
            "birth_date": "10.12.1970",
            "primary_condition": "Koronare Herzkrankheit (3-Gefäß-KHK)",
            "current_status": "Zustand nach PTCA mit Stentimplantation",
            "specialty": "Kardiologie",
            "comorbidities": ["Diabetes Mellitus Typ 2", "Hypercholesterinämie"]
        },
        {
            "id": "456789",
            "last_name": "Fischer",
            "first_name": "Maria",
            "birth_date": "22.08.1955",
            "primary_condition": "Hüftgelenkarthrose rechts",
            "current_status": "Geplante Hüft-TEP",
            "specialty": "Orthopädie",
            "comorbidities": ["Osteoporose", "Hypertension artérielle"]
        },
        {
            "id": "567890",
            "last_name": "Becker",
            "first_name": "Thomas",
            "birth_date": "05.09.1962",
            "primary_condition": "Cholezystolithiasis",
            "current_status": "Geplante laparoskopische Cholezystektomie",
            "specialty": "Chirurgie",
            "comorbidities": ["COPD", "Hypertension artérielle"]
        }
    ]
    
    for patient_data in patients_data:
        existing_patient = db.query(Patient).filter(Patient.id == patient_data["id"]).first()
        if not existing_patient:
            patient = Patient(
                id=patient_data["id"],
                last_name=patient_data["last_name"],
                first_name=patient_data["first_name"],
                birth_date=patient_data["birth_date"],
                primary_condition=patient_data["primary_condition"],
                current_status=patient_data["current_status"]
            )
            db.add(patient)
            db.commit()  # Commit pour sauvegarder le patient
            
            # Ajouter les comorbidités
            for comorbidity_name in patient_data["comorbidities"]:
                comorbidity = db.query(Comorbidity).filter(Comorbidity.name == comorbidity_name).first()
                if comorbidity:
                    patient.comorbidities.append(comorbidity)
            
            # Ajouter des rapports spécifiques selon la spécialité
            if patient_data["specialty"] == "Onkologie":
                reports = [
                    {
                        "id": f"onco_{patient_data['id']}_1",
                        "type": "Radiologie",
                        "title": "CT Thorax/Abdomen (Staging)",
                        "date": "2025-01-15",
                        "doctor": "Dr. Radiologie",
                        "summary": "Staging-Untersuchung zeigt lokalisierte Erkrankung ohne Fernmetastasen.",
                        "full_text": f"CT-Untersuchung bei {patient.first_name} {patient.last_name} zur Staging-Evaluation. Befund zeigt eine lokalisierte Läsion ohne Anzeichen einer Fernmetastasierung. Empfehlung: Weiterführende onkologische Therapie."
                    },
                    {
                        "id": f"onco_{patient_data['id']}_2",
                        "type": "Pathologie",
                        "title": "Histopathologischer Befund",
                        "date": "2025-01-20",
                        "doctor": "Dr. Pathologie",
                        "summary": "Adenokarzinom, mäßig differenziert, R0-Resektion.",
                        "full_text": f"Histopathologische Untersuchung des Resektats von {patient.first_name} {patient.last_name}. Befund: Adenokarzinom, mäßig differenziert. Alle Resektionsränder tumorfrei (R0). Empfehlung für adjuvante Therapie."
                    }
                ]
            elif patient_data["specialty"] == "Kardiologie":
                reports = [
                    {
                        "id": f"cardio_{patient_data['id']}_1",
                        "type": "Radiologie",
                        "title": "Koronarangiographie",
                        "date": "2025-01-10",
                        "doctor": "Dr. Kardiologe",
                        "summary": "3-Gefäß-KHK, erfolgreiche Stentimplantation in LAD.",
                        "full_text": f"Koronarangiographie bei {patient.first_name} {patient.last_name}. Befund: Hochgradige Stenosen in drei Koronargefäßen. Erfolgreiche PTCA mit Stentimplantation in der LAD. Gute Reperfusion."
                    }
                ]
            elif patient_data["specialty"] == "Orthopädie":
                reports = [
                    {
                        "id": f"ortho_{patient_data['id']}_1",
                        "type": "Radiologie",
                        "title": "Röntgen Hüfte beidseits",
                        "date": "2025-01-05",
                        "doctor": "Dr. Orthopäde",
                        "summary": "Hochgradige Koxarthrose rechts, Indikation zur Hüft-TEP.",
                        "full_text": f"Röntgenuntersuchung der Hüfte bei {patient.first_name} {patient.last_name}. Befund: Hochgradige Arthrose des rechten Hüftgelenks mit Gelenkspaltverschmälerung und Osteophytenbildung. Klare Indikation zur endoprothetischen Versorgung."
                    }
                ]
            else:
                reports = [
                    {
                        "id": f"gen_{patient_data['id']}_1",
                        "type": "Arztbrief",
                        "title": "Aufnahmebefund",
                        "date": "2025-01-01",
                        "doctor": "Dr. Hausarzt",
                        "summary": f"Aufnahme zur Behandlung von {patient_data['primary_condition']}.",
                        "full_text": f"Patient {patient.first_name} {patient.last_name} wurde zur stationären Behandlung aufgenommen. Diagnose: {patient_data['primary_condition']}. Geplante Therapie entsprechend Leitlinien."
                    }
                ]
            
            for report_data in reports:
                report = Report(
                    id=report_data["id"],
                    patient_id=patient_data["id"],
                    type=report_data["type"],
                    title=report_data["title"],
                    date=report_data["date"],
                    doctor=report_data["doctor"],
                    summary=report_data["summary"],
                    full_text=report_data["full_text"]
                )
                db.add(report)
    
    db.commit()
    db.close()

@app.get("/")
def read_root():
    return {"message": "RadGPT API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
