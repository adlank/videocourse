// Konfiguration für Test- und Produktionsmodus
export const config = {
  // Test-Modus: Alle Inhalte sind kostenlos zugänglich
  // Setzen Sie auf false für Produktions-Deployment
  testMode: true,
  
  // Wenn testMode = true:
  // - Alle Lektionen sind zugänglich (keine Mitgliedschafts-Prüfung)
  // - Alle Kurse sind sichtbar
  // - Keine Zahlungsbarrieren
  
  // Wenn testMode = false:
  // - Mitgliedschafts-Prüfungen sind aktiv
  // - Nur Vorschau-Lektionen für kostenlose Benutzer
  // - Stripe-Zahlungen erforderlich
  
  membership: {
    // Für Testzwecke: Alle haben Vollzugang
    allowAllAccess: true,
    
    // Produktions-Einstellungen (später aktivieren):
    requireActiveSubscription: false,
    allowPreviewLessons: true,
    maxFreeVideos: 3
  },
  
  payments: {
    // Stripe für Testzwecke deaktiviert
    enabled: false,
    
    // Test-Preise (später durch echte Preise ersetzen)
    monthlyPrice: 29.90,
    yearlyPrice: 299.90,
    currency: 'CHF'
  },
  
  features: {
    // Alle Features für Tests aktiviert
    videoPlayer: true,
    progressTracking: true,
    bookmarks: true,
    notes: true,
    certificates: true,
    quizzes: false // Noch nicht implementiert
  }
}

// Helper-Funktionen
export const isTestMode = () => config.testMode
export const hasFullAccess = () => config.testMode || config.membership.allowAllAccess
export const isPaymentRequired = () => !config.testMode && config.payments.enabled

// Für später: Produktions-Konfiguration
export const enableProductionMode = () => {
  config.testMode = false
  config.membership.allowAllAccess = false
  config.membership.requireActiveSubscription = true
  config.payments.enabled = true
}

export default config
