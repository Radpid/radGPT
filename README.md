# RadGPT - Assistant IA pour Radiologie

Application web moderne pour l'analyse de rapports radiologiques avec intelligence artificielle intégrée.

## 🚀 Fonctionnalités

- **Interface utilisateur moderne** : React + TypeScript + Tailwind CSS
- **Authentification sécurisée** : Système de login avec JWT
- **Recherche de patients** : Recherche rapide par ID, nom ou prénom
- **Chat IA intelligent** : Analyse des rapports médicaux avec Gemini AI
- **Gestion des rapports** : Visualisation des rapports radiologiques et pathologiques
- **Thème adaptatif** : Mode sombre/clair automatique
- **API REST complète** : Backend Python avec FastAPI

## 🏗️ Architecture

```
radGPT/
├── frontend/           # Application React/TypeScript
│   ├── src/
│   │   ├── components/ # Composants réutilisables
│   │   ├── pages/      # Pages de l'application
│   │   ├── services/   # Services API
│   │   ├── store/      # État global Redux
│   │   └── ...
│   └── ...
├── backend/           # API Python FastAPI
│   ├── app/
│   │   ├── models/    # Modèles de données
│   │   ├── routers/   # Routes API
│   │   ├── services/  # Services métier
│   │   └── ...
│   └── ...
└── README.md
```

## 🛠️ Installation et Configuration

### Prérequis

- **Node.js** 18+ et npm
- **Python** 3.8+
- **Clé API Gemini** (optionnel pour l'IA)

### 1. Frontend (React)

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur http://localhost:5173

### 2. Backend (Python API)

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
pip install -r requirements.txt

# Configurer la clé API Gemini (optionnel)
# Modifier GEMINI_API_KEY dans le fichier .env

# Démarrer le serveur API
python run.py
```

L'API sera disponible sur http://localhost:8000
Documentation API : http://localhost:8000/docs

### 3. Configuration rapide (Windows)

Utilisez le script de setup automatique :

```bash
# Frontend
npm install
npm run dev

# Backend (dans un autre terminal)
cd backend
setup.bat
```

## 👤 Compte de test

Pour tester l'application, utilisez ces identifiants :

- **Email** : `dr.schmidt@klinik.de`
- **Mot de passe** : `password123`

Un patient de test (ID: 123456) est disponible avec des rapports médicaux.

## 🔧 Configuration avancée

### Base de données

Par défaut, l'application utilise SQLite pour la simplicité. Pour PostgreSQL :

1. Modifiez `DATABASE_URL` dans `backend/.env`
2. Installez les dépendances PostgreSQL : `pip install psycopg2-binary`

### Gemini AI

1. Obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Modifiez `GEMINI_API_KEY` dans `backend/.env`

## 📚 Utilisation

1. **Connexion** : Utilisez les identifiants de test
2. **Recherche** : Cherchez un patient par ID, nom ou prénom
3. **Analyse** : Posez des questions sur les rapports médicaux
4. **Chat IA** : L'IA analyse automatiquement les données du patient

## 🛠️ Technologies utilisées

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Router
- Framer Motion
- Material-UI

### Backend
- Python 3.8+
- FastAPI
- SQLAlchemy
- JWT Authentication
- Google Gemini AI
- SQLite/PostgreSQL

## 📝 Développement

### Scripts disponibles

**Frontend :**
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run lint` - Vérification du code

**Backend :**
- `python run.py` - Serveur de développement
- `python -m pytest` - Tests unitaires

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
