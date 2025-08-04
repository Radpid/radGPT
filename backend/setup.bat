@echo off
echo Configuration du backend RadGPT...

echo Installation de Python et des dependances...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Configuration terminee!
echo.
echo Pour demarrer le serveur:
echo python run.py
echo.
echo L'API sera disponible sur http://localhost:8000
echo Documentation disponible sur http://localhost:8000/docs
pause
