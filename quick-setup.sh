#!/bin/bash

echo "🚀 Configuration rapide de radGPT..."

# Créer les dossiers
mkdir -p frontend backend

# Installer les dépendances du projet principal
echo "📦 Installation des dépendances principales..."
npm install

# Configuration du backend
echo "🐍 Configuration du backend Python..."
cd backend
pip install -r requirements.txt
cd ..

# Configuration du frontend React
echo "⚛️ Configuration du frontend React..."
cd frontend
npx create-react-app . --template typescript --yes
npm install axios
cd ..

echo "✅ Configuration terminée!"
echo ""
echo "🌐 Pour démarrer les services:"
echo "  npm run dev"
echo ""
echo "📋 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
