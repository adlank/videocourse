# KursPlattform - Video-Kurs-Plattform

Eine moderne Video-Kurs-Plattform ähnlich wie Flenski, entwickelt mit Next.js, Supabase und Stripe.

## 🚀 Features

### Für Kunden
- **Benutzerregistrierung und -anmeldung** mit Supabase Auth
- **Flexible Memberships** - monatlich oder jährlich
- **Kurskatalog** mit Kategorien und Schwierigkeitsgraden
- **Video-Player** mit Fortschrittsverfolgung
- **Dashboard** mit Lernstatistiken und Fortschritt
- **Mobile-responsive Design**

### Für Administratoren
- **Kursverwaltung** - Kurse und Lektionen erstellen/bearbeiten
- **Benutzerverwaltung** - Mitgliedschaften verwalten
- **Analytics** - Lernfortschritt und Engagement verfolgen

## 🛠 Tech Stack

- **Frontend**: Next.js 14 mit TypeScript
- **Styling**: Tailwind CSS + Radix UI Komponenten
- **Backend & Datenbank**: Supabase (PostgreSQL)
- **Authentifizierung**: Supabase Auth
- **Zahlungen**: Stripe für Subscriptions
- **Video-Hosting**: Supabase Storage (oder externes CDN)

## 📋 Setup-Anleitung

### 1. Abhängigkeiten installieren

\`\`\`bash
npm install
\`\`\`

### 2. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei basierend auf `env.example`:

\`\`\`bash
cp env.example .env.local
\`\`\`

Füllen Sie die folgenden Variablen aus:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Supabase Setup

1. Erstellen Sie ein neues Projekt auf [supabase.com](https://supabase.com)
2. Führen Sie das SQL-Schema aus: `supabase/schema.sql`
3. Konfigurieren Sie die Auth-Einstellungen in Supabase Dashboard

### 4. Stripe Setup

1. Erstellen Sie ein Stripe-Konto
2. Konfigurieren Sie Products und Prices für Ihre Membership-Pläne
3. Aktualisieren Sie die `stripe_price_id_monthly` und `stripe_price_id_yearly` in der Datenbank

### 5. Entwicklungsserver starten

\`\`\`bash
npm run dev
\`\`\`

Die Anwendung ist nun unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 📁 Projektstruktur

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard für angemeldete Benutzer
│   ├── login/            # Anmelde-Seite
│   ├── register/         # Registrierungs-Seite
│   ├── courses/          # Kurskatalog und Kursdetails
│   └── auth/             # Auth-Callbacks
├── components/
│   ├── ui/               # Wiederverwendbare UI-Komponenten
│   ├── layout/           # Header, Footer, Navigation
│   └── course/           # Kurs-spezifische Komponenten
├── lib/
│   ├── supabase/         # Supabase Client-Konfiguration
│   └── utils.ts          # Utility-Funktionen
└── types/
    └── database.types.ts # TypeScript-Typen für Datenbank
\`\`\`

## 🗄 Datenbank-Schema

### Haupttabellen

- **profiles** - Benutzerprofil-Erweiterung
- **membership_plans** - Verfügbare Membership-Pläne
- **user_memberships** - Aktive Benutzer-Memberships
- **course_categories** - Kurskategorien
- **courses** - Kurse mit Metadaten
- **course_lessons** - Einzelne Video-Lektionen
- **user_progress** - Lernfortschritt pro Benutzer

## 🔐 Sicherheit

- **Row Level Security (RLS)** für alle Tabellen aktiviert
- **Authentifizierung** über Supabase Auth
- **API-Schutz** durch Middleware
- **Sichere Zahlungen** über Stripe

## 🎨 UI/UX Features

- **Responsive Design** - Optimiert für Desktop und Mobile
- **Dark/Light Mode** (geplant)
- **Barrierefreiheit** - WCAG-konform
- **Moderne Animationen** mit Framer Motion (geplant)

## 📈 Geplante Features

- [ ] Admin-Panel für Kursverwaltung
- [ ] Video-Upload mit Transcoding
- [ ] Offline-Video-Download
- [ ] Zertifikate nach Kursabschluss
- [ ] Community-Features (Kommentare, Diskussionen)
- [ ] Mobile App (React Native)

## 🚀 Deployment

### Vercel (Empfohlen)

1. Verbinden Sie Ihr GitHub-Repository mit Vercel
2. Konfigurieren Sie Umgebungsvariablen in Vercel Dashboard
3. Deploy automatisch bei jedem Push

### Andere Plattformen

Die App kann auf jeder Plattform deployed werden, die Next.js unterstützt:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Commit Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie eine Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- Öffnen Sie ein Issue auf GitHub
- Kontaktieren Sie uns über [support@kursplattform.com]
- Dokumentation: [docs.kursplattform.com]

---

**Entwickelt mit ❤️ für effektives Online-Lernen**
\`\`\`