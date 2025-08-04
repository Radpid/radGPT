# RadGPT Backend

Backend API pour l'application RadGPT - Assistant IA pour radiologie.

## Installation

1. **Installer Python 3.8+**
   - Téléchargez depuis [python.org](https://python.org)
   - Vérifiez l'installation : `python --version`

2. **Installer les dépendances**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configuration**
   - Le fichier `.env` est déjà configuré avec SQLite pour simplifier le démarrage
   - Pour utiliser Gemini AI, obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Modifiez `GEMINI_API_KEY` dans le fichier `.env`

4. **Démarrer le serveur**
   ```bash
   python run.py
   ```

   Ou utilisez le script de setup :
   ```bash
   setup.bat
   ```

## Fonctionnalités

- **Authentification** : Login/Register avec JWT
- **Gestion des patients** : CRUD patients et rapports médicaux
- **Chat IA** : Intégration avec Gemini AI pour l'analyse des rapports
- **Base de données** : SQLite (facilement modifiable vers PostgreSQL)

## API Endpoints

- `POST /auth/register` - Créer un compte
- `POST /auth/token` - Se connecter
- `GET /auth/me` - Profil utilisateur
- `GET /patients` - Liste des patients
- `GET /patients/{id}` - Détails d'un patient
- `POST /chat` - Envoyer un message à l'IA
- `GET /chat/{patient_id}/history` - Historique du chat

## Documentation

Une fois le serveur démarré, la documentation est disponible sur :
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Compte de test

- Email: `dr.schmidt@klinik.de`
- Mot de passe: `password123`

Ce compte est créé automatiquement au démarrage avec des données de test.

## Structure

```
backend/
├── app/
│   ├── main.py          # Point d'entrée de l'application
│   ├── config.py        # Configuration
│   ├── database.py      # Configuration base de données
│   ├── models/          # Modèles SQLAlchemy
│   ├── schemas/         # Schémas Pydantic
│   ├── routers/         # Routes API
│   └── services/        # Services métier
├── requirements.txt     # Dépendances Python
├── run.py              # Script de démarrage
└── .env               # Variables d'environnement
```
