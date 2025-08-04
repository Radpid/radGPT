import google.generativeai as genai
from ..config import settings
from typing import List
from ..models.database import Patient, Report

class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def get_patient_analysis(self, patient: Patient, user_question: str, date_filter: dict = None) -> str:
        """
        Analyse les données du patient avec Gemini AI
        """
        # Construire le contexte du patient avec filtre temporel
        context = self._build_patient_context(patient, date_filter)
        
        # Créer le prompt pour Gemini
        prompt = f"""
        Du bist ein medizinischer Assistent. Analysiere die Patientendaten und beantworte die Frage direkt.

        PATIENTENDATEN:
        {context}

        FRAGE: {user_question}

        ANTWORT-REGELN:
        - Direkte, präzise Antworten ohne Einleitung
        - Verwende nummerierte Listen (1., 2., 3.) oder einfache Absätze
        - Jede Information auf einer neuen Zeile
        - Formatierung: **Fett** für wichtige Begriffe, *kursiv* für Details
        - Bei fehlenden Daten: "Keine Angaben verfügbar"
        - Antwort in deutscher Sprache

        BEISPIEL-FORMAT:
        1. **Befund:** Details der Untersuchung
        2. **Diagnose:** Medizinische Bewertung  
        3. **Empfehlung:** Weitere Schritte
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Fehler bei der Analyse: {str(e)}"
    
    async def get_general_query(self, user_question: str, db_session) -> str:
        """
        Traite les requêtes générales sans patient spécifique
        """
        # Analyser la question pour déterminer le type de requête
        if any(keyword in user_question.lower() for keyword in ['liste', 'patients', 'heute', 'chirurgie', 'onkologie', 'kardiologie']):
            return await self._handle_patient_list_query(user_question, db_session)
        elif any(keyword in user_question.lower() for keyword in ['statistik', 'anzahl', 'zusammenfassung']):
            return await self._handle_statistics_query(user_question, db_session)
        else:
            return await self._handle_general_medical_query(user_question)

    async def _handle_patient_list_query(self, question: str, db_session) -> str:
        """
        Gère les requêtes de liste de patients
        """
        from ..models.database import Patient
        
        # Déterminer le département demandé
        department = None
        if 'chirurgie' in question.lower():
            department = 'Chirurgie'
        elif 'onkologie' in question.lower():
            department = 'Onkologie'
        elif 'kardiologie' in question.lower():
            department = 'Kardiologie'
        elif 'orthopädie' in question.lower():
            department = 'Orthopädie'
        
        # Requête pour récupérer les patients
        if department:
            patients = db_session.query(Patient).filter(
                Patient.primary_condition.contains(department)
            ).limit(10).all()
        else:
            patients = db_session.query(Patient).limit(10).all()
        
        if not patients:
            return "**Keine Patienten gefunden**\n\n*Aktuell sind keine Patienten in der Datenbank registriert.*"
        
        # Formater la réponse
        response = f"**Patientenliste** *({len(patients)} Patienten)*\n\n"
        
        for i, patient in enumerate(patients, 1):
            response += f"**{i}. {patient.first_name} {patient.last_name}**\n"
            response += f"• *ID:* {patient.id}\n"
            response += f"• *Diagnose:* {patient.primary_condition}\n"
            response += f"• *Status:* {patient.current_status}\n"
            response += f"• *Geboren:* {patient.birth_date}\n\n"
        
        return response

    async def _handle_statistics_query(self, question: str, db_session) -> str:
        """
        Gère les requêtes statistiques
        """
        from ..models.database import Patient
        from sqlalchemy import func
        
        total_patients = db_session.query(Patient).count()
        
        # Statistiques par département
        dept_stats = db_session.query(
            Patient.primary_condition,
            func.count(Patient.id).label('count')
        ).group_by(Patient.primary_condition).all()
        
        response = f"**Patientenstatistiken**\n\n"
        response += f"• **Gesamt:** {total_patients} Patienten\n\n"
        
        if dept_stats:
            response += "**Verteilung nach Fachbereich:**\n"
            for condition, count in dept_stats:
                response += f"• *{condition}:* {count} Patienten\n"
        
        return response

    async def _handle_general_medical_query(self, question: str) -> str:
        """
        Gère les questions médicales générales
        """
        prompt = f"""
        Du bist ein medizinischer Assistent. Beantworte die folgende allgemeine medizinische Frage präzise und professionell.

        FRAGE: {question}

        ANTWORTSTIL:
        - Verwende Markdown für Formatierung: **Fett**, *Kursiv*
        - Kurze, präzise Antworten
        - Verwende Stichpunkte für strukturierte Informationen
        - Medizinische Fachbegriffe korrekt verwenden
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"**Fehler bei der Verarbeitung**\n\n*{str(e)}*"
        """
        Construit le contexte textuel du patient pour Gemini
        """
        context = f"""
        Nom: {patient.first_name} {patient.last_name}
        Date de naissance: {patient.birth_date}
        Condition principale: {patient.primary_condition or 'Non spécifiée'}
        Statut actuel: {patient.current_status or 'Non spécifié'}
        
        Comorbidités:
        """
        if patient.comorbidities:
            for comorbidity in patient.comorbidities:
                context += f"- {comorbidity.name}\n"
        else:
            context += "Aucune comorbidité enregistrée\n"
        
        context += "\nRapports médicaux:\n"
        if patient.reports:
            for report in patient.reports:
                context += f"""
                [{report.type}] {report.title}
                Date: {report.date}
                Médecin: {report.doctor}
                Résumé: {report.summary or 'Pas de résumé'}
                Texte complet: {report.full_text or 'Pas de texte complet'}
                ---
                """
        else:
            context += "Aucun rapport médical disponible\n"
        
        return context
    
    async def analyze_reports(self, reports: List[Report]) -> str:
        """
        Analyse générale de plusieurs rapports
        """
        if not reports:
            return "Aucun rapport à analyser."
        
        reports_text = ""
        for report in reports:
            reports_text += f"""
            Type: {report.type}
            Titre: {report.title}
            Date: {report.date}
            Résumé: {report.summary or ''}
            Texte: {report.full_text or ''}
            ---
            """
        
        prompt = f"""
        Analysiere die folgenden medizinischen Berichte und erstelle eine strukturierte Gesamtanalyse:

        {reports_text}

        Bitte erstelle eine strukturierte Analyse auf Deutsch mit folgenden Abschnitten:
        
        **Allgemeiner Zustand des Patienten:**
        
        **Zeitliche Entwicklung:**
        
        **Wichtige Befunde:**
        
        **Empfehlungen:**
        
        Verwende medizinische Fachbegriffe korrekt und fasse die wichtigsten Punkte prägnant zusammen.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Fehler bei der Analyse der Berichte: {str(e)}"

    def _build_patient_context(self, patient, date_filter: dict = None) -> str:
        """
        Construit le contexte textuel du patient pour Gemini
        """
        context = f"""
        Patient: {patient.first_name} {patient.last_name}
        Geburtsdatum: {patient.birth_date}
        Hauptdiagnose: {patient.primary_condition or 'Nicht angegeben'}
        Aktueller Status: {patient.current_status or 'Nicht angegeben'}
        
        Komorbiditäten:
        """
        if patient.comorbidities:
            for comorbidity in patient.comorbidities:
                context += f"- {comorbidity.name}\n"
        else:
            context += "Keine Komorbiditäten dokumentiert\n"
        
        context += "\nMedizinische Berichte:\n"
        if patient.reports:
            # Filtrer les rapports par date si un filtre est fourni
            filtered_reports = patient.reports
            if date_filter and date_filter.get('startDate') and date_filter.get('endDate'):
                from datetime import datetime
                start_date = datetime.fromisoformat(date_filter['startDate'])
                end_date = datetime.fromisoformat(date_filter['endDate'])
                filtered_reports = [
                    report for report in patient.reports
                    if start_date <= datetime.fromisoformat(report.date) <= end_date
                ]
                context += f"(Zeitraum: {date_filter['startDate']} bis {date_filter['endDate']})\n"
            
            for report in filtered_reports:
                context += f"""
[{report.type}] {report.title}
Datum: {report.date}
Arzt: {report.doctor}
Zusammenfassung: {report.summary or 'Keine Zusammenfassung'}
Volltext: {report.full_text or 'Kein Volltext verfügbar'}
---
"""
        else:
            context += "Keine medizinischen Berichte verfügbar\n"
        
        return context
