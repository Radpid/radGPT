.PHONY: setup install dev clean build test

# Configuration automatique complète
setup:
	@echo "🚀 Configuration automatique de radGPT..."
	@chmod +x setup.sh
	@./setup.sh

# Installation des dépendances
install:
	@echo "📦 Installation des dépendances..."
	@npm install
	@cd frontend && npm install
	@cd backend && pip install -r requirements.txt

# Développement
dev:
	@echo "🔧 Démarrage des services de développement..."
	@concurrently "make dev-backend" "make dev-frontend"

dev-frontend:
	@cd frontend && npm start

dev-backend:
	@cd backend && python app.py

# Build
build:
	@echo "🏗️  Build du projet..."
	@cd frontend && npm run build

# Tests
test:
	@echo "🧪 Exécution des tests..."
	@cd frontend && npm test
	@cd backend && python -m pytest

# Nettoyage
clean:
	@echo "🧹 Nettoyage..."
	@rm -rf frontend/node_modules
	@rm -rf backend/venv
	@rm -rf frontend/build

# Base de données
db-setup:
	@echo "🗄️  Configuration de la base de données..."
	@docker-compose up -d postgres

# Logs
logs:
	@echo "📋 Logs des services..."
	@docker-compose logs -f

# Status
status:
	@echo "📊 État des services..."
	@curl -s http://localhost:8000/api/health || echo "Backend non disponible"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend disponible" || echo "Frontend non disponible"
