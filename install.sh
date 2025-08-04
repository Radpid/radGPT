#!/bin/bash

echo "🚀 Installation automatique complète de radGPT..."
echo "⏱️  Cela prendra quelques minutes..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[radGPT]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Créer package.json principal
log "Création du package.json principal..."
cat > package.json << 'EOF'
{
  "name": "radgpt",
  "version": "1.0.0",
  "description": "radGPT - Application complète",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && python app.py",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && pip install -r requirements.txt"
  },
  "dependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# 2. Créer structure des dossiers
log "Création de la structure des dossiers..."
mkdir -p frontend/src/components frontend/src/services backend

# 3. Créer requirements.txt pour le backend
log "Création des dépendances Python..."
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
EOF

# 4. Créer l'API backend
log "Création de l'API backend..."
cat > backend/app.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

app = FastAPI(title="radGPT API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "radGPT API running!", "timestamp": datetime.now().isoformat()}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "radGPT"}

@app.post("/api/chat")
def chat(message: dict):
    return {"response": f"radGPT: {message.get('text', '')}", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    print("🚀 radGPT Backend démarré sur http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
EOF

# 5. Installer les dépendances principales
log "Installation des dépendances npm..."
npm install

# 6. Configuration du frontend React
log "Configuration du frontend React..."
cd frontend
npx create-react-app . --template typescript --yes > /dev/null 2>&1
npm install axios > /dev/null 2>&1

# 7. Créer le composant principal du frontend
cat > src/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import './App.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test de connexion au backend
    fetch('http://localhost:8000/api/health')
      .then(() => setIsConnected(true))
      .catch(() => setIsConnected(false));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });

      const data = await response.json();
      const botMessage: Message = {
        text: data.response,
        sender: 'bot',
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🩺 radGPT</h1>
        <div className="status">
          Status: {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
        </div>
        
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <strong>{msg.sender === 'user' ? 'Vous' : 'radGPT'}:</strong>
                <p>{msg.text}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tapez votre message..."
            />
            <button onClick={sendMessage}>Envoyer</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
EOF

# 8. Créer le CSS
cat > src/App.css << 'EOF'
.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
}

.status {
  margin: 10px 0;
  font-size: 14px;
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: black;
}

.message {
  margin-bottom: 15px;
  text-align: left;
  padding: 10px;
  border-radius: 5px;
}

.message.user {
  background-color: #e3f2fd;
  margin-left: 20%;
}

.message.bot {
  background-color: #f5f5f5;
  margin-right: 20%;
}

.input-area {
  display: flex;
  padding: 20px;
  border-top: 1px solid #eee;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
}

.input-area button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
EOF

cd ..

# 9. Installer les dépendances du backend
log "Installation des dépendances Python..."
cd backend
pip install -r requirements.txt
cd ..

# 10. Créer script de démarrage
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage de radGPT..."
npm run dev
EOF

chmod +x start.sh

success "Installation terminée!"
echo ""
echo "🎉 radGPT est prêt!"
echo ""
echo "🚀 Pour démarrer:"
echo "  npm run dev"
echo "  ou"
echo "  ./start.sh"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "⚡ Démarrage automatique dans 3 secondes..."
sleep 3

npm run dev
EOF
