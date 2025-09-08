'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  CreditCard, 
  Globe, 
  Mail, 
  Shield,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  HardDrive
} from 'lucide-react'
import Link from 'next/link'

interface PlatformSettings {
  // Plattform-Grundeinstellungen
  platformName: string
  platformDescription: string
  instructorName: string
  instructorEmail: string
  supportEmail: string
  
  // Stripe-Einstellungen
  stripePublishableKey: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  stripeConnected: boolean
  
  // Subscription-Preise
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  
  // E-Mail-Einstellungen
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  
  // Sicherheitseinstellungen
  enableTwoFactor: boolean
  sessionTimeout: number
  maxLoginAttempts: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Krav Maga Academy',
    platformDescription: 'Professionelle Selbstverteidigungskurse online',
    instructorName: 'Krav Maga Expert',
    instructorEmail: 'instructor@kravmaga.com',
    supportEmail: 'support@kravmaga.com',
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    stripeConnected: false,
    monthlyPrice: 29.90,
    yearlyPrice: 299.90,
    currency: 'CHF',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  })
  
  const [saving, setSaving] = useState(false)
  const [showStripeKeys, setShowStripeKeys] = useState(false)
  const [testingStripe, setTestingStripe] = useState(false)

  useEffect(() => {
    // Lade gespeicherte Einstellungen
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Mock API call - später durch echten API-Call ersetzen
      console.log('Loading settings...')
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Mock API call - später durch echten API-Call ersetzen
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const testStripeConnection = async () => {
    setTestingStripe(true)
    try {
      // Mock Stripe-Test
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSettings(prev => ({ ...prev, stripeConnected: true }))
    } catch (error) {
      console.error('Stripe connection failed:', error)
    } finally {
      setTestingStripe(false)
    }
  }

  const updateSetting = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Speichere...' : 'Einstellungen speichern'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Zahlungen
          </TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="mr-2 h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            E-Mail
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Sicherheit
          </TabsTrigger>
        </TabsList>

        {/* Allgemeine Einstellungen */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plattform-Informationen</CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihre Krav Maga Schule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Plattform-Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => updateSetting('platformName', e.target.value)}
                    placeholder="z.B. Krav Maga Academy"
                  />
                </div>
                <div>
                  <Label htmlFor="instructorName">Instructor-Name</Label>
                  <Input
                    id="instructorName"
                    value={settings.instructorName}
                    onChange={(e) => updateSetting('instructorName', e.target.value)}
                    placeholder="Ihr Name als Instructor"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="platformDescription">Beschreibung</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => updateSetting('platformDescription', e.target.value)}
                  placeholder="Beschreibung Ihrer Krav Maga Schule"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructorEmail">Instructor E-Mail</Label>
                  <Input
                    id="instructorEmail"
                    type="email"
                    value={settings.instructorEmail}
                    onChange={(e) => updateSetting('instructorEmail', e.target.value)}
                    placeholder="instructor@kravmaga.com"
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support E-Mail</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                    placeholder="support@kravmaga.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zahlungseinstellungen */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Stripe-Integration</span>
                <div className="flex items-center space-x-2">
                  {settings.stripeConnected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verbunden
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Nicht verbunden
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie Stripe für Abonnement-Zahlungen. 
                <a 
                  href="https://dashboard.stripe.com/apikeys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  API-Keys von Stripe Dashboard abrufen →
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                <div className="relative">
                  <Input
                    id="stripePublishableKey"
                    type={showStripeKeys ? "text" : "password"}
                    value={settings.stripePublishableKey}
                    onChange={(e) => updateSetting('stripePublishableKey', e.target.value)}
                    placeholder="pk_test_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowStripeKeys(!showStripeKeys)}
                  >
                    {showStripeKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  type={showStripeKeys ? "text" : "password"}
                  value={settings.stripeSecretKey}
                  onChange={(e) => updateSetting('stripeSecretKey', e.target.value)}
                  placeholder="sk_test_..."
                />
              </div>
              
              <div>
                <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                <Input
                  id="stripeWebhookSecret"
                  type={showStripeKeys ? "text" : "password"}
                  value={settings.stripeWebhookSecret}
                  onChange={(e) => updateSetting('stripeWebhookSecret', e.target.value)}
                  placeholder="whsec_..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={testStripeConnection} 
                  disabled={testingStripe || !settings.stripePublishableKey || !settings.stripeSecretKey}
                  variant="outline"
                >
                  {testingStripe ? 'Teste Verbindung...' : 'Stripe-Verbindung testen'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription-Preise</CardTitle>
              <CardDescription>
                Legen Sie die Preise für monatliche und jährliche Abonnements fest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="monthlyPrice">Monatlicher Preis</Label>
                  <div className="relative">
                    <Input
                      id="monthlyPrice"
                      type="number"
                      step="0.01"
                      value={settings.monthlyPrice}
                      onChange={(e) => updateSetting('monthlyPrice', parseFloat(e.target.value))}
                      className="pl-12"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {settings.currency}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="yearlyPrice">Jährlicher Preis</Label>
                  <div className="relative">
                    <Input
                      id="yearlyPrice"
                      type="number"
                      step="0.01"
                      value={settings.yearlyPrice}
                      onChange={(e) => updateSetting('yearlyPrice', parseFloat(e.target.value))}
                      className="pl-12"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {settings.currency}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="currency">Währung</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={settings.currency}
                    onChange={(e) => updateSetting('currency', e.target.value)}
                  >
                    <option value="CHF">CHF - Schweizer Franken</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Preisvorschau:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Monatlich: <strong>{settings.currency} {settings.monthlyPrice}</strong> pro Monat</p>
                  <p>Jährlich: <strong>{settings.currency} {settings.yearlyPrice}</strong> pro Jahr 
                    <span className="text-green-600 ml-2">
                      (Ersparnis: {settings.currency} {(settings.monthlyPrice * 12 - settings.yearlyPrice).toFixed(2)})
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage-Einstellungen */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Storage</CardTitle>
              <CardDescription>
                Konfiguration der Storage Buckets für Video- und Bild-Uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Storage Buckets sind erforderlich für das Hochladen von Videos und Thumbnails.
                  Ohne korrekte Konfiguration funktionieren die Upload-Funktionen nicht.
                </div>
                <Link href="/admin/settings/storage">
                  <Button>
                    <HardDrive className="mr-2 h-4 w-4" />
                    Storage konfigurieren
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-Mail-Einstellungen */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP-Konfiguration</CardTitle>
              <CardDescription>
                Konfigurieren Sie E-Mail-Versand für Benachrichtigungen und Bestätigungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpUser">SMTP Benutzername</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Passwort</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                    placeholder="App-spezifisches Passwort"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sicherheitseinstellungen */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie Sicherheitsrichtlinien für Ihre Plattform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session-Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max. Login-Versuche</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableTwoFactor"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => updateSetting('enableTwoFactor', e.target.checked)}
                />
                <Label htmlFor="enableTwoFactor">Zwei-Faktor-Authentifizierung aktivieren</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
