#!/bin/bash

echo "🚀 Installation ultra-rapide de radGPT avec Vite..."

# --- Configuration ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[radGPT]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

# --- Étape 1: Nettoyage et préparation ---
log "Nettoyage des installations précédentes..."
rm -rf frontend backend node_modules package*.* yarn.lock pnpm-lock.yaml

log "Création de la structure de base..."
mkdir -p backend

# --- Étape 2: Fichier package.json principal ---
log "Création du package.json principal..."
cat > package.json << 'EOF'
{
  "name": "radgpt-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm:dev:backend\" \"npm:dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && uvicorn app:app --host 0.0.0.0 --reload",
    "install:all": "npm install && (cd frontend && npm install) && (cd backend && pip install -r requirements.txt)"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# --- Étape 3: Configuration du Backend ---
log "Configuration du backend FastAPI..."
cat > backend/requirements.txt << 'EOF'
fastapi
uvicorn[standard]
python-multipart
EOF

cat > backend/app.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="radGPT API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.get("/api/health")
def health(): return {"status": "ok"}

@app.post("/api/chat")
async def chat(message: dict):
    return {"response": f"radGPT a traité : {message.get('text', '')}"}
EOF

# --- Étape 4: Création du Frontend avec Vite (ultra-rapide) ---
log "Création du frontend React avec Vite..."
npm create vite@latest frontend -- --template react-ts > /dev/null 2>&1
success "Frontend Vite créé."

# --- Étape 5: Personnalisation du Frontend ---
log "Personnalisation de l'application React..."
cd frontend
npm install axios > /dev/null 2>&1

# Remplacer App.tsx
cat > src/App.tsx << 'EOF'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [apiStatus, setApiStatus] = useState('offline')

  useEffect(() => {
    const port = window.location.port.replace('5173', '8000');
    const apiUrl = `${window.location.protocol}//${window.location.hostname.replace('5173', '8000')}/api/health`;
    
    fetch(apiUrl)
      .then(res => res.ok ? setApiStatus('online') : setApiStatus('error'))
      .catch(() => setApiStatus('error'))
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const apiUrl = `${window.location.protocol}//${window.location.hostname.replace('5173', '8000')}/api/chat`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
    const data = await res.json()
    const botMsg = { sender: 'bot', text: data.response }
    setMessages(prev => [...prev, botMsg])
  }

  return (
    <div className="container">
      <header>
        <h1>radGPT 🩺</h1>
        <p>API Status: <span className={apiStatus}>{apiStatus}</span></p>
      </header>
      <main className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </main>
      <footer>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Posez votre question..."
        />
        <button onClick={handleSend}>Envoyer</button>
      </footer>
    </div>
  )
}

export default App
EOF

# Remplacer App.css
cat > src/App.css << 'EOF'
:root { --bg-color: #f0f2f5; --text-color: #333; --primary-color: #007bff; }
body { margin: 0; font-family: sans-serif; background: var(--bg-color); color: var(--text-color); }
.container { display: flex; flex-direction: column; height: 100vh; max-width: 768px; margin: auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
header { padding: 1rem; border-bottom: 1px solid #eee; text-align: center; }
header h1 { margin: 0; }
header .online { color: #28a745; }
header .error, header .offline { color: #dc3545; }
.chat-box { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column;}
.message { padding: 0.5rem 1rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 70%; }
.message.user { background: var(--primary-color); color: white; align-self: flex-end; }
.message.bot { background: #e9ecef; color: #333; align-self: flex-start; }
footer { display: flex; padding: 1rem; border-top: 1px solid #eee; }
footer input { flex: 1; padding: 0.75rem; border: 1px solid #ccc; border-radius: 1rem; margin-right: 0.5rem; }
footer button { padding: 0.75rem 1.5rem; border: none; background: var(--primary-color); color: white; border-radius: 1rem; cursor: pointer; }
EOF

# Revenir à la racine
cd ..

# --- Étape 6: Installation finale ---
log "Installation de toutes les dépendances..."
npm run install:all

# --- FIN ---
success "🎉 Installation terminée!"
echo ""
echo "🚀 Pour démarrer tous les services, exécutez:"
echo "   npm run dev"
echo ""
echo "🌐 URLs disponibles après le démarrage:"
echo "   Frontend: Port 5173 (Vite)"
echo "   Backend:  Port 8000"
echo ""
echo "⚡ Démarrage automatique dans 3 secondes..."
sleep 3
npm run dev
