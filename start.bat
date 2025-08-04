@echo off
echo.
echo ========================================
echo   RadGPT - Demarrage de l'application
echo ========================================
echo.

echo 1. Demarrage du backend...
cd /d "%~dp0backend"
start "RadGPT Backend" cmd /k "python run.py"

echo 2. Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo 3. Demarrage du frontend...
cd /d "%~dp0"
start "RadGPT Frontend" cmd /k "npm run dev"

echo.
echo L'application RadGPT est en cours de demarrage...
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo Documentation API: http://localhost:8000/docs
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
