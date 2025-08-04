from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Table d'association pour les comorbidités
patient_comorbidity = Table(
    'patient_comorbidity',
    Base.metadata,
    Column('patient_id', String, ForeignKey('patients.id')),
    Column('comorbidity_id', Integer, ForeignKey('comorbidities.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(String, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    last_name = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    birth_date = Column(String, nullable=False)
    primary_condition = Column(String)
    current_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    reports = relationship("Report", back_populates="patient")
    comorbidities = relationship("Comorbidity", secondary=patient_comorbidity, back_populates="patients")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    type = Column(String, nullable=False)  # 'Radiologie', 'Pathologie', 'Arztbrief'
    title = Column(String, nullable=False)
    date = Column(String, nullable=False)
    doctor = Column(String, nullable=False)
    summary = Column(Text)
    full_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    patient = relationship("Patient", back_populates="reports")

class Comorbidity(Base):
    __tablename__ = "comorbidities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    
    # Relations
    patients = relationship("Patient", secondary=patient_comorbidity, back_populates="comorbidities")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    sender = Column(String, nullable=False)  # 'user' or 'ai'
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
