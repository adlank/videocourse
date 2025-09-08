# 🚀 Deployment Guide - Video Kurs Plattform

## Schnelle Deployment-Optionen

### 1. 🟢 Vercel (Empfohlen)

**Schritt 1: GitHub Repository erstellen**
```bash
# In Ihrem Projekt-Ordner
git init
git add .
git commit -m "Initial commit - Video Kurs Plattform"
```

**Schritt 2: Vercel Setup**
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Melden Sie sich mit GitHub an
3. Klicken Sie "New Project"
4. Wählen Sie Ihr Repository
5. Vercel erkennt automatisch Next.js

**Schritt 3: Environment Variables hinzufügen**
In Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=ihre_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=ihr_service_role_key

# Stripe (optional)
STRIPE_SECRET_KEY=ihr_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=ihr_stripe_public_key
STRIPE_WEBHOOK_SECRET=ihr_webhook_secret

# App Config
NEXTAUTH_SECRET=ein_starkes_geheimnis
NEXTAUTH_URL=https://ihre-domain.vercel.app
```

**Schritt 4: Deploy**
- Vercel deployed automatisch bei jedem Git Push
- Ihre Plattform ist sofort online verfügbar!

---

### 2. 🟡 Netlify (Alternative)

**Setup:**
1. Gehen Sie zu [netlify.com](https://netlify.com)
2. "New site from Git"
3. Repository auswählen
4. Build Command: `npm run build`
5. Publish Directory: `.next`

**Environment Variables:**
Gleiche wie bei Vercel, in Netlify Dashboard hinzufügen.

---

### 3. 🔵 Railway (Für erweiterte Kontrolle)

**Vorteile:**
- Vollständige Server-Kontrolle
- Integrierte Datenbank-Optionen
- Docker-Support

**Setup:**
1. [railway.app](https://railway.app) besuchen
2. "Deploy from GitHub"
3. Environment Variables hinzufügen
4. Automatisches Deployment

---

## 📋 Vor dem Deployment - Checkliste

### ✅ Environment Variables prüfen
Stellen Sie sicher, dass Sie haben:
- Supabase URL und Keys
- Stripe Keys (falls verwendet)
- NextAuth Secret

### ✅ Supabase Setup
- Row Level Security (RLS) Policies aktiv
- Storage Buckets öffentlich (für Videos/Thumbnails)
- Alle SQL-Scripts ausgeführt

### ✅ Test-Daten
- Mindestens einen Admin-User
- Ein paar Test-Kurse
- Test-Videos hochgeladen

---

## 🎯 Empfohlener Workflow

### 1. **Lokale Tests abschließen**
```bash
npm run dev
# Alles funktioniert? ✅
```

### 2. **Git Repository erstellen**
```bash
git init
git add .
git commit -m "Ready for deployment"
# GitHub Repository erstellen und pushen
```

### 3. **Vercel Deployment**
- Vercel mit GitHub verknüpfen
- Environment Variables hinzufügen  
- Automatisches Deployment ✅

### 4. **Domain teilen**
```
https://ihr-projekt-name.vercel.app
```

---

## 🔧 Troubleshooting

### Problem: Build-Fehler
**Lösung:** Prüfen Sie:
- Alle Dependencies installiert
- TypeScript-Fehler behoben
- Environment Variables gesetzt

### Problem: Supabase-Verbindung
**Lösung:** 
- URLs und Keys prüfen
- RLS Policies testen
- Storage-Zugriff verifizieren

### Problem: Videos laden nicht
**Lösung:**
- Storage Buckets öffentlich machen
- CORS-Einstellungen prüfen
- URLs testen

---

## 💡 Pro-Tipps

### Für Tests mit externen Personen:
1. **Test-Accounts erstellen** mit verschiedenen Rollen
2. **Demo-Inhalte** hochladen
3. **Einfache URLs** teilen
4. **Feedback-System** einrichten

### Performance-Optimierung:
- Next.js Image-Optimierung nutzen
- Videos komprimiert hochladen
- CDN für statische Assets

### Sicherheit:
- Environment Variables niemals in Code
- Starke Passwörter für Test-Accounts
- RLS Policies testen

---

## 📞 Support

Bei Problemen:
1. Vercel/Netlify Logs prüfen
2. Browser-Konsole checken
3. Supabase Dashboard überprüfen

**Deployment-Zeit:** ~5-10 Minuten ⚡
**Kosten:** Kostenlos für Tests 💰
**Verfügbarkeit:** Sofort weltweit 🌍
