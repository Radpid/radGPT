#!/bin/bash
set -e

echo "🚀 Setting up RadGPT development environment..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd /workspaces/radGPT/backend
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd /workspaces/radGPT
npm install

echo "✅ Setup complete!"
echo "🎯 To start the application:"
echo "   - Backend: cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo "   - Frontend: npm run dev"
