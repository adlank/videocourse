#!/usr/bin/env node

/**
 * 🚀 Deployment Setup Script
 * Bereitet das Projekt für Vercel/Netlify Deployment vor
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Video Kurs Plattform - Deployment Setup\n');

// 1. Prüfe Package.json
console.log('📦 Prüfe package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredScripts = {
  'build': 'next build',
  'start': 'next start',
  'dev': 'next dev'
};

let scriptsOk = true;
for (const [script, command] of Object.entries(requiredScripts)) {
  if (!packageJson.scripts[script]) {
    console.log(`❌ Script "${script}" fehlt`);
    scriptsOk = false;
  } else if (packageJson.scripts[script] !== command) {
    console.log(`⚠️  Script "${script}": "${packageJson.scripts[script]}" (erwartet: "${command}")`);
  } else {
    console.log(`✅ Script "${script}": OK`);
  }
}

// 2. Prüfe .env.local
console.log('\n🔑 Prüfe Environment Variables...');
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Gefunden`);
    } else {
      console.log(`❌ ${varName}: Fehlt`);
    }
  });
} else {
  console.log('❌ .env.local Datei nicht gefunden');
}

// 3. Erstelle .env.example für Deployment
console.log('\n📝 Erstelle .env.example...');
const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr_anon_key
SUPABASE_SERVICE_ROLE_KEY=ihr_service_role_key

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXTAUTH_SECRET=ihr_starkes_geheimnis
NEXTAUTH_URL=https://ihre-domain.vercel.app

# Test Mode (für Entwicklung)
NODE_ENV=production
`;

fs.writeFileSync('.env.example', envExample);
console.log('✅ .env.example erstellt');

// 4. Prüfe wichtige Dateien
console.log('\n📁 Prüfe wichtige Dateien...');
const importantFiles = [
  'next.config.ts',
  'tailwind.config.ts',
  'tsconfig.json',
  'package.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

importantFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: OK`);
  } else {
    console.log(`❌ ${file}: Fehlt`);
  }
});

// 5. Erstelle .gitignore falls nötig
console.log('\n🚫 Prüfe .gitignore...');
const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment Variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Supabase
.supabase/
`;

if (!fs.existsSync('.gitignore')) {
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .gitignore erstellt');
} else {
  console.log('✅ .gitignore existiert bereits');
}

// 6. Deployment-Anweisungen
console.log('\n🎯 DEPLOYMENT BEREIT!\n');
console.log('📋 Nächste Schritte:');
console.log('1. GitHub Repository erstellen');
console.log('2. Code hochladen:');
console.log('   git init');
console.log('   git add .');
console.log('   git commit -m "Ready for deployment"');
console.log('   git remote add origin https://github.com/username/repo.git');
console.log('   git push -u origin main');
console.log('');
console.log('3. Vercel Setup:');
console.log('   - Gehen Sie zu vercel.com');
console.log('   - "New Project" → Repository auswählen');
console.log('   - Environment Variables aus .env.local hinzufügen');
console.log('   - Deploy! 🚀');
console.log('');
console.log('🌍 Ihre Plattform wird dann unter https://ihr-projekt.vercel.app verfügbar sein');
console.log('');
console.log('💡 Tipp: Teilen Sie die URL mit Testern und sammeln Sie Feedback!');
