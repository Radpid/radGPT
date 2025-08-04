# 🚀 RadGPT - GitHub Codespaces Setup

Ce projet est configuré pour fonctionner avec GitHub Codespaces !

## 🎯 Démarrage rapide avec Codespaces

### Méthode 1: Depuis GitHub.com
1. Allez sur votre repository GitHub
2. Cliquez sur le bouton vert **"Code"**
3. Sélectionnez l'onglet **"Codespaces"**
4. Cliquez sur **"Create codespace on main"**

### Méthode 2: Depuis l'URL directe
Utilisez ce lien (remplacez `USERNAME` par votre nom d'utilisateur GitHub) :
```
https://github.com/codespaces/new?repo=USERNAME/radGPT
```

## 🛠 Une fois dans Codespaces

### Démarrer le Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Démarrer le Frontend (Vite + React)
Dans un nouveau terminal :
```bash
npm run dev
```

## 🌐 Accès aux services

- **Frontend**: Port 3000 (Vite development server)
- **Backend**: Port 8000 (FastAPI server)

Les ports sont automatiquement forwardés et vous recevrez des notifications avec les URLs d'accès.

## 📝 Variables d'environnement

Si votre application nécessite des variables d'environnement (comme des clés API), vous pouvez :

1. Les ajouter dans les **Secrets** de votre repository GitHub
2. Les configurer dans **Settings > Secrets and variables > Codespaces**

## 🔧 Configuration

La configuration Codespaces se trouve dans `.devcontainer/devcontainer.json` et inclut :
- Python 3.13
- Node.js 20
- Extensions VS Code utiles
- Configuration automatique des ports

## 🆘 Problèmes courants

### Si les dépendances ne s'installent pas automatiquement :
```bash
# Pour Python
cd backend && pip install -r requirements.txt

# Pour Node.js  
npm install
```

### Si les ports ne sont pas forwardés :
1. Ouvrez l'onglet **"Ports"** dans VS Code
2. Cliquez sur **"Forward a Port"**
3. Ajoutez les ports 3000 et 8000
