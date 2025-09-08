'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  stripe_price_id: string
  price: number
  currency: string
  interval: string
  interval_count: number
  trial_period_days: number
  is_active: boolean
  features: string[]
  created_at: string
  updated_at: string
}

interface StripeSettings {
  publishable_key: string
  webhook_secret: string
  monthly_price_id: string
  yearly_price_id: string
}

export default function StripeSettingsPage() {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [settings, setSettings] = useState<StripeSettings>({
    publishable_key: '',
    webhook_secret: '',
    monthly_price_id: '',
    yearly_price_id: ''
  })
  const [showSecrets, setShowSecrets] = useState({
    webhook_secret: false
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Abonnement-Pläne laden
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price')

      if (plansError) throw plansError
      setPlans(plansData || [])

      // Stripe-Einstellungen aus Environment Variables (simuliert)
      setSettings({
        publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        webhook_secret: '***HIDDEN***',
        monthly_price_id: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
        yearly_price_id: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || ''
      })

    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // In einer echten Implementierung würden Sie diese Einstellungen
      // sicher in einer Admin-Konfigurationstabelle speichern
      setSuccess('Einstellungen gespeichert! Bitte aktualisieren Sie Ihre .env.local Datei.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePlan = async (planData: Partial<SubscriptionPlan>) => {
    setSaving(true)
    setError(null)

    try {
      if (editingPlan) {
        // Plan aktualisieren
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            ...planData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlan.id)

        if (error) throw error
      } else {
        // Neuen Plan erstellen
        const { error } = await supabase
          .from('subscription_plans')
          .insert({
            ...planData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      setEditingPlan(null)
      loadData()
      setSuccess('Plan erfolgreich gespeichert!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Plan löschen möchten?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      
      loadData()
      setSuccess('Plan erfolgreich gelöscht!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('In Zwischenablage kopiert!')
    setTimeout(() => setSuccess(null), 2000)
  }

  const formatPrice = (amount: number, currency: string = 'CHF') => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Stripe Einstellungen</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="h-32 bg-gray-200 animate-pulse" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stripe Einstellungen</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center">
            <CreditCard className="mr-1 h-3 w-3" />
            Stripe Integration
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">API Einstellungen</TabsTrigger>
          <TabsTrigger value="plans">Abonnement-Pläne</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Stripe API Konfiguration
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie Ihre Stripe API-Schlüssel und Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publishable_key">Publishable Key</Label>
                  <div className="flex mt-1">
                    <Input
                      id="publishable_key"
                      value={settings.publishable_key}
                      onChange={(e) => setSettings(prev => ({ ...prev, publishable_key: e.target.value }))}
                      placeholder="pk_test_..."
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyToClipboard(settings.publishable_key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Öffentlicher Schlüssel für Frontend-Integration
                  </p>
                </div>

                <div>
                  <Label htmlFor="webhook_secret">Webhook Secret</Label>
                  <div className="flex mt-1">
                    <Input
                      id="webhook_secret"
                      type={showSecrets.webhook_secret ? 'text' : 'password'}
                      value={settings.webhook_secret}
                      onChange={(e) => setSettings(prev => ({ ...prev, webhook_secret: e.target.value }))}
                      placeholder="whsec_..."
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => setShowSecrets(prev => ({ ...prev, webhook_secret: !prev.webhook_secret }))}
                    >
                      {showSecrets.webhook_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Secret für Webhook-Verifizierung
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_price_id">Monthly Price ID</Label>
                  <Input
                    id="monthly_price_id"
                    value={settings.monthly_price_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, monthly_price_id: e.target.value }))}
                    placeholder="price_..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stripe Price ID für monatliches Abonnement
                  </p>
                </div>

                <div>
                  <Label htmlFor="yearly_price_id">Yearly Price ID</Label>
                  <Input
                    id="yearly_price_id"
                    value={settings.yearly_price_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, yearly_price_id: e.target.value }))}
                    placeholder="price_..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Stripe Price ID für jährliches Abonnement
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Speichere...' : 'Einstellungen speichern'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wichtige Links</CardTitle>
              <CardDescription>
                Nützliche Links für die Stripe-Konfiguration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://dashboard.stripe.com/test/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">API Keys</div>
                    <div className="text-sm text-gray-500">Stripe Dashboard</div>
                  </div>
                </a>
                <a
                  href="https://dashboard.stripe.com/test/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Webhooks</div>
                    <div className="text-sm text-gray-500">Webhook-Endpunkte</div>
                  </div>
                </a>
                <a
                  href="https://dashboard.stripe.com/test/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Produkte & Preise</div>
                    <div className="text-sm text-gray-500">Abonnement-Pläne</div>
                  </div>
                </a>
                <a
                  href="https://dashboard.stripe.com/test/customers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Kunden</div>
                    <div className="text-sm text-gray-500">Kundenverwaltung</div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Abonnement-Pläne</h2>
            <Button onClick={() => setEditingPlan({} as SubscriptionPlan)}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`${!plan.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">
                      {formatPrice(plan.price, plan.currency)}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.interval === 'month' ? 'Monat' : 'Jahr'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 font-mono">
                      {plan.stripe_price_id}
                    </div>

                    {plan.trial_period_days > 0 && (
                      <Badge variant="outline">
                        {plan.trial_period_days} Tage kostenlos
                      </Badge>
                    )}

                    <div className="space-y-1">
                      {plan.features?.slice(0, 3).map((feature, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                      {plan.features?.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{plan.features.length - 3} weitere Features
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPlan(plan)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Löschen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook-Konfiguration</CardTitle>
              <CardDescription>
                Konfigurieren Sie Webhooks für automatische Abonnement-Updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Webhook-Endpunkt URL</Label>
                  <div className="flex mt-1">
                    <Input
                      value={`${window.location.origin}/api/stripe/webhook`}
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyToClipboard(`${window.location.origin}/api/stripe/webhook`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Fügen Sie diese URL in Ihrem Stripe Dashboard hinzu
                  </p>
                </div>

                <div>
                  <Label>Erforderliche Events</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      'checkout.session.completed',
                      'customer.subscription.created',
                      'customer.subscription.updated',
                      'customer.subscription.deleted',
                      'invoice.payment_succeeded',
                      'invoice.payment_failed'
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {event}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Stellen Sie sicher, dass Sie diese Events in Ihrem Stripe Webhook-Endpunkt aktiviert haben.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Editor Modal würde hier implementiert werden */}
    </div>
  )
}
