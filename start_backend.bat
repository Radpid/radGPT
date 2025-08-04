@echo off
cd backend
echo Démarrage du serveur backend...
python -m uvicorn app.main:app --reload --port 8000
pause
