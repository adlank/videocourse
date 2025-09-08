# 🚀 Hostinger/Plesk Deployment Guide
## Video Kurse Platform

Diese Anleitung erklärt, wie Sie die Video Kurse Platform auf Hostinger mit Plesk deployen.

## 📋 Voraussetzungen

### Hostinger Account:
- ✅ **Business Plan oder höher** (Node.js Support erforderlich)
- ✅ **Plesk Panel** Zugang
- ✅ **SSH Zugang** (optional, aber empfohlen)
- ✅ **Node.js 18+** Support

### Externe Services:
- ✅ **Supabase Account** (Datenbank & Auth)
- ✅ **Stripe Account** (Payments) - Optional

---

## 🔧 Schritt 1: Hostinger Vorbereitung

### 1.1 Domain & Hosting Setup
1. **Loggen Sie sich in Hostinger ein**
2. **Gehen Sie zum Plesk Panel**
3. **Wählen Sie Ihre Domain**
4. **Aktivieren Sie Node.js** (falls nicht bereits aktiv)

### 1.2 Node.js Konfiguration
1. **Plesk Panel** → **Node.js**
2. **Node.js Version:** 18+ wählen
3. **Document Root:** `/httpdocs`
4. **Application Root:** `/httpdocs`
5. **Startup File:** `server.js`

---

## 📦 Schritt 2: Projekt Upload

### 2.1 Dateien hochladen
**Option A: File Manager (Plesk)**
1. **Plesk** → **File Manager**
2. **Navigieren zu:** `/httpdocs`
3. **Upload:** Alle Projektdateien (außer `node_modules`)

**Option B: SSH/SFTP**
```bash
# Via SFTP
scp -r ./video-kurse-platform/* username@your-domain.com:/httpdocs/

# Via SSH (auf Server)
cd /httpdocs
git clone https://github.com/yourusername/videocourse.git .
```

### 2.2 Dependencies installieren
**Via Plesk Node.js Panel:**
1. **Node.js** → **NPM Install**
2. Oder **SSH:**
```bash
cd /httpdocs
npm install --production
```

---

## ⚙️ Schritt 3: Environment Variables

### 3.1 In Plesk konfigurieren
**Plesk** → **Node.js** → **Environment Variables**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...

# Stripe Configuration (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://ihre-domain.com
```

### 3.2 .env.local erstellen (Alternative)
```bash
# Via SSH
cd /httpdocs
nano .env.local
# Fügen Sie alle Environment Variables hinzu
```

---

## 🏗️ Schritt 4: Build & Deployment

### 4.1 Build erstellen
**Via Plesk Node.js Panel:**
1. **Node.js** → **Run Script**
2. **Script:** `npm run hostinger:build`

**Via SSH:**
```bash
cd /httpdocs
npm run build
```

### 4.2 Server starten
**Via Plesk:**
1. **Node.js** → **Enable Node.js**
2. **Restart App**

**Via SSH mit PM2:**
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

---

## 🗄️ Schritt 5: Supabase Setup

### 5.1 Database Schema importieren
1. **Supabase Dashboard** → **SQL Editor**
2. **Führen Sie aus:** `supabase/schema.sql`

### 5.2 Storage Buckets erstellen
```sql
-- In Supabase SQL Editor
-- Führen Sie aus: create-storage-buckets.sql
```

### 5.3 Admin User erstellen
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (gen_random_uuid(), 'admin@ihre-domain.com', crypt('IhrPasswort', gen_salt('bf')), now(), now(), now());

INSERT INTO public.profiles (id, email, is_admin, created_at, updated_at)
VALUES ((SELECT id FROM auth.users WHERE email = 'admin@ihre-domain.com'), 'admin@ihre-domain.com', true, now(), now());
```

---

## 🔧 Schritt 6: Stripe Setup (Optional)

### 6.1 Webhook konfigurieren
1. **Stripe Dashboard** → **Webhooks**
2. **Endpoint URL:** `https://ihre-domain.com/api/stripe/webhook`
3. **Events:** `checkout.session.completed`, `customer.subscription.updated`

### 6.2 Produkte erstellen
1. **Stripe Dashboard** → **Products**
2. **Erstellen Sie:** Monatliches & Jährliches Abo
3. **Kopieren Sie:** Price IDs in Environment Variables

---

## ✅ Schritt 7: Testing & Verification

### 7.1 Website testen
- ✅ **Homepage:** `https://ihre-domain.com`
- ✅ **Admin Login:** `https://ihre-domain.com/admin/login`
- ✅ **Registration:** `https://ihre-domain.com/register`
- ✅ **Course Catalog:** `https://ihre-domain.com/courses`

### 7.2 Funktionalitäten prüfen
- ✅ **User Registration/Login**
- ✅ **Admin Panel**
- ✅ **Course Management**
- ✅ **Video Upload**
- ✅ **Payment System** (falls Stripe konfiguriert)

---

## 🚨 Troubleshooting

### Häufige Probleme:

**1. "Application failed to start"**
```bash
# Logs prüfen
pm2 logs video-kurse-platform
# oder in Plesk: Node.js → Logs
```

**2. "Module not found"**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install --production
```

**3. "Database connection failed"**
- ✅ Environment Variables prüfen
- ✅ Supabase URL/Keys validieren
- ✅ Netzwerk-Firewall prüfen

**4. "Static files not loading"**
- ✅ `.htaccess` Konfiguration prüfen
- ✅ File permissions: `chmod 755`

---

## 📊 Performance Optimierung

### 1. Caching aktivieren
```apache
# In .htaccess bereits konfiguriert
# Cache Control für Static Assets
```

### 2. Gzip Komprimierung
```apache
# In .htaccess bereits aktiviert
# Reduziert Dateigröße um ~70%
```

### 3. CDN Integration (Optional)
- **Cloudflare** für globale Performance
- **Hostinger CDN** aktivieren

---

## 🔐 Sicherheit

### 1. HTTPS aktivieren
- **Plesk** → **SSL/TLS Certificates**
- **Let's Encrypt** kostenlos aktivieren

### 2. Security Headers
```apache
# In .htaccess bereits konfiguriert
# X-Frame-Options, XSS-Protection, etc.
```

### 3. File Permissions
```bash
# Korrekte Permissions setzen
chmod 755 /httpdocs
chmod 644 /httpdocs/.htaccess
chmod 600 /httpdocs/.env.local
```

---

## 📈 Monitoring & Wartung

### 1. Logs überwachen
```bash
# PM2 Logs
pm2 logs --lines 100

# Plesk Logs
# Node.js Panel → Logs
```

### 2. Updates deployen
```bash
# Code Updates
git pull origin main
npm run build
pm2 restart video-kurse-platform
```

### 3. Backup Strategy
- ✅ **Code:** Git Repository
- ✅ **Database:** Supabase automatische Backups
- ✅ **Files:** Plesk Backup Manager

---

## 📞 Support

**Bei Problemen:**
1. **Hostinger Support:** 24/7 Chat verfügbar
2. **Plesk Dokumentation:** docs.plesk.com
3. **Next.js Docs:** nextjs.org/docs

---

**🎉 Ihre Video Kurse Platform ist jetzt live auf Hostinger!**

**Admin URL:** `https://ihre-domain.com/admin/login`
**Website URL:** `https://ihre-domain.com`
