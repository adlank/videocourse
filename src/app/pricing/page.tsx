'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getStripe, formatPrice, subscriptionPlans } from '@/lib/stripe'
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  PlayCircle,
  BookOpen,
  Smartphone,
  MessageCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const canceled = searchParams?.get('canceled') === 'true'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setUserProfile(profile)
      }
    }
    getUser()
  }, [supabase])

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    setLoading(planType)
    setError(null)

    try {
      // In einer echten Implementierung würden Sie hier die Stripe Price IDs verwenden
      // Diese müssen in Ihrem Stripe Dashboard erstellt werden
      const priceIds = {
        monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
        yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder'
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceIds[planType],
          planType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Checkout-Session')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe konnte nicht geladen werden')
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (err: any) {
      console.error('Subscription error:', err)
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (planType: string) => {
    return userProfile?.subscription_plan === planType && 
           userProfile?.subscription_status === 'active'
  }

  const hasActiveSubscription = userProfile?.subscription_status === 'active'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wählen Sie Ihren Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Erhalten Sie unbegrenzten Zugang zu allen Krav Maga Kursen
          </p>
          
          {canceled && (
            <Alert className="max-w-md mx-auto mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Zahlung wurde abgebrochen. Sie können jederzeit einen anderen Plan auswählen.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="max-w-md mx-auto mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasActiveSubscription && (
            <Alert className="max-w-md mx-auto mb-8 border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Sie haben bereits ein aktives Abonnement ({userProfile.subscription_plan}).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monatlicher Plan */}
          <Card className="relative border-2 hover:border-blue-500 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {subscriptionPlans.monthly.name}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {subscriptionPlans.monthly.description}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(subscriptionPlans.monthly.price)}
                </span>
                <span className="text-gray-500 ml-2">/Monat</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {subscriptionPlans.monthly.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading === 'monthly' || isCurrentPlan('monthly')}
                className="w-full"
                variant={isCurrentPlan('monthly') ? 'outline' : 'default'}
              >
                {loading === 'monthly' ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird geladen...
                  </div>
                ) : isCurrentPlan('monthly') ? (
                  'Aktueller Plan'
                ) : (
                  'Monatlich abonnieren'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Jährlicher Plan */}
          <Card className="relative border-2 border-blue-500 shadow-lg transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-semibold">
                <Star className="w-4 h-4 mr-1" />
                BELIEBT
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-600">
                {subscriptionPlans.yearly.name}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {subscriptionPlans.yearly.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl text-gray-400 line-through">
                    {formatPrice(subscriptionPlans.yearly.originalPrice!)}
                  </span>
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(subscriptionPlans.yearly.price)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  /Jahr • Sparen Sie {formatPrice(subscriptionPlans.yearly.savings!)}
                </div>
                <div className="text-sm text-blue-600 font-semibold mt-1">
                  Das sind nur {formatPrice(Math.round(subscriptionPlans.yearly.price / 12))}/Monat
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {subscriptionPlans.yearly.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className={`text-gray-700 ${feature.includes('GRATIS') ? 'font-semibold text-blue-600' : ''}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe('yearly')}
                disabled={loading === 'yearly' || isCurrentPlan('yearly')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                variant={isCurrentPlan('yearly') ? 'outline' : 'default'}
              >
                {loading === 'yearly' ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird geladen...
                  </div>
                ) : isCurrentPlan('yearly') ? (
                  'Aktueller Plan'
                ) : (
                  'Jährlich abonnieren'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Was Sie erhalten
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unsere Plattform bietet Ihnen alles, was Sie für Ihr Krav Maga Training benötigen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PlayCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Professionelle Videos</h3>
              <p className="text-gray-600">
                Hochqualitative Lehrvideos von erfahrenen Krav Maga Instruktoren
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Strukturierte Kurse</h3>
              <p className="text-gray-600">
                Systematisch aufgebaute Lektionen vom Anfänger bis zum Experten
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fortschrittsverfolgung</h3>
              <p className="text-gray-600">
                Verfolgen Sie Ihren Lernfortschritt und setzen Sie Bookmarks
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mobile App</h3>
              <p className="text-gray-600">
                Lernen Sie überall und jederzeit mit unserer mobilen App
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Tauschen Sie sich mit anderen Lernenden in unserem Forum aus
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sichere Zahlung</h3>
              <p className="text-gray-600">
                Alle Zahlungen werden sicher über Stripe abgewickelt
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Häufig gestellte Fragen
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kann ich jederzeit kündigen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ja, Sie können Ihr Abonnement jederzeit in Ihren Kontoeinstellungen kündigen. 
                  Sie haben bis zum Ende Ihres Abrechnungszeitraums weiterhin Zugang zu allen Inhalten.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gibt es eine Geld-zurück-Garantie?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ja, wir bieten eine 14-tägige Geld-zurück-Garantie. Wenn Sie nicht zufrieden sind, 
                  erhalten Sie Ihr Geld vollständig zurück.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Wie viele Geräte kann ich verwenden?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sie können Ihr Konto auf bis zu 3 Geräten gleichzeitig verwenden. 
                  Perfekt für Desktop, Tablet und Smartphone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gray-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bereit anzufangen?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Beginnen Sie noch heute Ihre Krav Maga Reise
          </p>
          {!user ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Erstellen Sie zuerst ein kostenloses Konto
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg">
                    Kostenloses Konto erstellen
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Bereits Mitglied? Anmelden
                  </Button>
                </Link>
              </div>
            </div>
          ) : !hasActiveSubscription ? (
            <p className="text-gray-600">
              Wählen Sie einen Plan oben aus, um zu beginnen
            </p>
          ) : (
            <Link href="/dashboard">
              <Button size="lg">
                Zu Ihrem Dashboard
              </Button>
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Lädt...</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PricingContent />
    </Suspense>
  )
}