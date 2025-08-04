const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installation automatique de radGPT...\n');

const steps = [
  {
    name: 'Vérification de Node.js',
    command: 'node --version',
    description: 'Vérification de la version Node.js'
  },
  {
    name: 'Vérification de Python',
    command: 'python3 --version',
    description: 'Vérification de la version Python'
  },
  {
    name: 'Installation dépendances racine',
    command: 'npm install',
    description: 'Installation des dépendances du projet principal'
  },
  {
    name: 'Configuration frontend',
    command: 'cd frontend && npm install',
    description: 'Installation des dépendances du frontend'
  },
  {
    name: 'Configuration backend',
    command: 'cd backend && pip install -r requirements.txt',
    description: 'Installation des dépendances du backend'
  }
];

function executeStep(step) {
  try {
    console.log(`⏳ ${step.name}...`);
    execSync(step.command, { stdio: 'inherit' });
    console.log(`✅ ${step.description} - OK\n`);
  } catch (error) {
    console.log(`❌ ${step.description} - Erreur`);
    console.error(error.message);
    process.exit(1);
  }
}

// Exécution des étapes
steps.forEach(executeStep);

console.log('🎉 Installation terminée avec succès!');
console.log('\n📋 Commandes disponibles:');
console.log('  npm run dev          - Démarrer le développement');
console.log('  make setup           - Configuration complète');
console.log('  make dev             - Développement avec Makefile');
console.log('\n🌐 URLs après démarrage:');
console.log('  Frontend: http://localhost:3000');
console.log('  Backend:  http://localhost:8000');
