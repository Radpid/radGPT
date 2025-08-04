# 🚀 Guide de Démarrage Rapide - RadGPT

## Installation en 3 étapes

### 1. Installer les dépendances

**Frontend :**
```bash
npm install
```

**Backend :**
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configuration (Optionnel)

**Pour utiliser l'IA Gemini :**
1. Obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Modifiez `GEMINI_API_KEY` dans `backend/.env`

### 3. Démarrage

**Option A - Script automatique (Windows) :**
```bash
start.bat
```

**Option B - Manuel :**

Terminal 1 (Backend) :
```bash
cd backend
python run.py
```

Terminal 2 (Frontend) :
```bash
npm run dev
```

## 🔐 Connexion Test

- **URL :** http://localhost:5173
- **Email :** dr.schmidt@klinik.de
- **Mot de passe :** password123

## 🧪 Test de l'Application

1. **Connexion** avec les identifiants ci-dessus
2. **Recherche** du patient test : tapez "123456" ou "Schmitt"
3. **Ouverture** du dossier patient
4. **Chat IA** : posez une question comme "Quel est l'état actuel du patient ?"

## 📊 Patient de Test

- **ID :** 123456
- **Nom :** Hans Schmitt
- **Condition :** Rektumkarzinom (cT3N1M0)
- **Rapports :** CT Thorax/Abdomen + Histopathologie

## 🛠️ Dépannage

**Le backend ne démarre pas ?**
- Vérifiez Python 3.8+ : `python --version`
- Réinstallez les dépendances : `pip install -r requirements.txt`

**Le frontend ne se connecte pas au backend ?**
- Vérifiez que le backend est sur http://localhost:8000
- Vérifiez la console pour les erreurs CORS

**L'IA ne répond pas ?**
- Configurez `GEMINI_API_KEY` dans `backend/.env`
- Redémarrez le backend après modification

## 🔗 URLs Importantes

- **Application :** http://localhost:5173
- **API Backend :** http://localhost:8000
- **Documentation API :** http://localhost:8000/docs
- **Base de données :** `backend/radgpt.db` (SQLite)

## 📝 Fonctionnalités Testables

✅ **Authentification** - Login/Logout
✅ **Recherche patients** - Par ID, nom, prénom  
✅ **Visualisation dossiers** - Rapports médicaux
✅ **Chat IA** - Questions sur les rapports
✅ **Thème adaptatif** - Mode sombre/clair
✅ **Interface responsive** - Mobile/Desktop

---

🎉 **Votre application RadGPT est prête !**
