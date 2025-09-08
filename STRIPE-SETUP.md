# 🚀 Stripe Abonnement-System Einrichtung

## 📋 Übersicht

Das Stripe Abonnement-System ermöglicht es Ihren Kunden, monatliche oder jährliche Abonnements abzuschließen, um Zugang zu allen Krav Maga Kursen zu erhalten.

## 🔧 1. Stripe-Konto einrichten

### Registrierung
1. Gehen Sie zu [https://stripe.com](https://stripe.com)
2. Erstellen Sie ein neues Konto oder melden Sie sich an
3. Vervollständigen Sie Ihr Profil und die Geschäftsinformationen

### Test-Modus aktivieren
- Stellen Sie sicher, dass Sie im **Test-Modus** sind (Toggle oben rechts)
- Alle Konfigurationen werden zunächst im Test-Modus durchgeführt

## 🔑 2. API-Schlüssel konfigurieren

### Schritt 1: API-Schlüssel abrufen
1. Gehen Sie zu [Stripe Dashboard → Entwickler → API-Schlüssel](https://dashboard.stripe.com/test/apikeys)
2. Kopieren Sie den **Publishable Key** (beginnt mit `pk_test_`)
3. Kopieren Sie den **Secret Key** (beginnt mit `sk_test_`)

### Schritt 2: Environment Variables setzen
Fügen Sie diese zu Ihrer `.env.local` Datei hinzu:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_IHRE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_IHRE_SECRET_KEY
```

## 💰 3. Produkte und Preise erstellen

### Schritt 1: Produkt erstellen
1. Gehen Sie zu [Stripe Dashboard → Produkte](https://dashboard.stripe.com/test/products)
2. Klicken Sie auf **"Produkt hinzufügen"**
3. Füllen Sie aus:
   - **Name**: "Krav Maga Academy Mitgliedschaft"
   - **Beschreibung**: "Unbegrenzter Zugang zu allen Krav Maga Video-Kursen"
   - **Bild**: Laden Sie Ihr Logo hoch (optional)

### Schritt 2: Preise hinzufügen
Für das **monatliche Abonnement**:
1. Klicken Sie auf **"Preis hinzufügen"**
2. Konfiguration:
   - **Preismodell**: Standardpreise
   - **Preis**: CHF 29.00
   - **Abrechnungsperiode**: Monatlich
   - **Verwendung**: Abonnement
3. Kopieren Sie die **Price ID** (beginnt mit `price_`)

Für das **jährliche Abonnement**:
1. Klicken Sie erneut auf **"Preis hinzufügen"**
2. Konfiguration:
   - **Preismodell**: Standardpreise
   - **Preis**: CHF 290.00
   - **Abrechnungsperiode**: Jährlich
   - **Verwendung**: Abonnement
3. Kopieren Sie die **Price ID** (beginnt mit `price_`)

### Schritt 3: Price IDs konfigurieren
Fügen Sie die Price IDs zu Ihrer `.env.local` hinzu:

```env
# Stripe Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_IHRE_MONATLICHE_PRICE_ID
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_IHRE_JAEHRLICHE_PRICE_ID
```

## 🔗 4. Webhooks einrichten

### Schritt 1: Webhook-Endpunkt erstellen
1. Gehen Sie zu [Stripe Dashboard → Entwickler → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Klicken Sie auf **"Endpunkt hinzufügen"**
3. Konfiguration:
   - **Endpunkt-URL**: `https://IHRE-DOMAIN.com/api/stripe/webhook`
   - **Beschreibung**: "Krav Maga Academy Webhook"

### Schritt 2: Events auswählen
Wählen Sie diese Events aus:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Schritt 3: Webhook Secret konfigurieren
1. Nach dem Erstellen des Endpunkts, klicken Sie darauf
2. Im Bereich **"Signing secret"**, klicken Sie auf **"Reveal"**
3. Kopieren Sie das Secret (beginnt mit `whsec_`)
4. Fügen Sie es zu Ihrer `.env.local` hinzu:

```env
STRIPE_WEBHOOK_SECRET=whsec_IHRE_WEBHOOK_SECRET
```

## 🗄️ 5. Datenbank einrichten

### SQL ausführen
Führen Sie das SQL-Script aus:
```bash
# In Supabase SQL Editor
# Führen Sie setup-subscription-system.sql aus
```

Dieses Script erstellt:
- Abonnement-Felder in der `profiles` Tabelle
- `payment_history` Tabelle
- `subscription_plans` Tabelle
- `subscription_events` Tabelle
- RLS Policies
- Hilfsfunktionen

## 🧪 6. Lokale Webhook-Tests

### Stripe CLI installieren
```bash
# Windows (mit Scoop)
scoop install stripe

# macOS (mit Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
# Download von https://github.com/stripe/stripe-cli/releases
```

### CLI konfigurieren
```bash
# Bei Stripe anmelden
stripe login

# Webhooks lokal weiterleiten
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Test-Zahlungen
Verwenden Sie diese Test-Kartennummern:
- **Erfolgreiche Zahlung**: `4242 4242 4242 4242`
- **Fehlgeschlagene Zahlung**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

## 🚀 7. Admin-Konfiguration

### Stripe-Einstellungen verwalten
1. Melden Sie sich als Admin an
2. Gehen Sie zu **Admin → Einstellungen → Stripe**
3. Konfigurieren Sie:
   - API-Schlüssel
   - Price IDs
   - Webhook-Einstellungen

### Abonnement-Pläne verwalten
Im Admin-Panel können Sie:
- Neue Pläne erstellen
- Preise anpassen
- Features verwalten
- Pläne aktivieren/deaktivieren

## ✅ 8. Funktionstest

### Testschritte
1. **Registrierung**: Neuen Benutzer erstellen
2. **Pricing-Seite**: `/pricing` besuchen
3. **Abonnement wählen**: Plan auswählen und Checkout starten
4. **Test-Zahlung**: Mit Test-Kartennummer bezahlen
5. **Bestätigung**: Erfolgsseite sollte angezeigt werden
6. **Zugang prüfen**: Benutzer sollte Zugang zu allen Kursen haben
7. **Admin-Panel**: Abonnement sollte in Admin-Übersicht sichtbar sein

### Webhook-Verifizierung
- Prüfen Sie in Stripe Dashboard → Webhooks → Ihr Endpunkt
- Sollte erfolgreiche Webhook-Aufrufe zeigen
- Logs sollten keine Fehler enthalten

## 🔄 9. Live-Deployment

### Produktions-Modus aktivieren
1. Wechseln Sie in Stripe zu **Live-Modus**
2. Erstellen Sie neue API-Schlüssel für Produktion
3. Erstellen Sie Produkte und Preise für Live-Modus
4. Konfigurieren Sie Webhooks für Produktions-URL
5. Aktualisieren Sie `.env.local` mit Live-Schlüsseln

### Sicherheitsprüfung
- ✅ Webhook-Endpunkt ist HTTPS
- ✅ Environment Variables sind sicher gespeichert
- ✅ RLS Policies sind aktiv
- ✅ Admin-Zugang ist geschützt

## 🆘 Troubleshooting

### Häufige Probleme

**Webhook-Fehler 400/401**
- Prüfen Sie STRIPE_WEBHOOK_SECRET
- Verifizieren Sie Endpunkt-URL
- Prüfen Sie erforderliche Events

**Checkout funktioniert nicht**
- Prüfen Sie NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Verifizieren Sie Price IDs
- Prüfen Sie Browser-Konsole auf Fehler

**Abonnement wird nicht aktiviert**
- Prüfen Sie Webhook-Logs in Stripe
- Verifizieren Sie Supabase-Verbindung
- Prüfen Sie RLS Policies

### Support-Ressourcen
- [Stripe Dokumentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook-Tester](https://webhook.site)

## 📊 10. Monitoring und Analytics

### Wichtige Metriken
- Conversion Rate (Besucher → Abonnenten)
- Churn Rate (Kündigungen)
- MRR (Monthly Recurring Revenue)
- LTV (Customer Lifetime Value)

### Stripe Dashboard nutzen
- **Übersicht**: Umsatz und Abonnements
- **Kunden**: Kundenverwaltung
- **Abonnements**: Abonnement-Status
- **Zahlungen**: Transaktionshistorie
- **Berichte**: Detaillierte Analytics

---

## 🎉 Herzlichen Glückwunsch!

Ihr Stripe Abonnement-System ist jetzt vollständig eingerichtet. Ihre Kunden können jetzt:

- ✅ Sichere Abonnements abschließen
- ✅ Automatische Verlängerungen erhalten  
- ✅ Zahlungen verwalten
- ✅ Abonnements kündigen

**Nächste Schritte:**
- Testen Sie das System gründlich
- Konfigurieren Sie E-Mail-Benachrichtigungen
- Implementieren Sie Customer Portal
- Überwachen Sie die Metriken
