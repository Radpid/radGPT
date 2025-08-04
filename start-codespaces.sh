#!/bin/bash

# Script de démarrage pour GitHub Codespaces
echo "🚀 Démarrage de RadGPT..."

# Fonction pour tuer les processus en arrière-plan lors de l'arrêt
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT

# Démarrer le backend
echo "🐍 Démarrage du backend FastAPI..."
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 3

# Retourner au répertoire racine et démarrer le frontend
echo "⚛️ Démarrage du frontend React..."
cd ..
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

echo "✅ Services démarrés !"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

# Attendre que les processus se terminent
wait
