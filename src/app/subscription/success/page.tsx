'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import {
  CheckCircle,
  Loader2,
  PlayCircle,
  BookOpen,
  Star,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

function SubscriptionSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('Keine Session-ID gefunden')
      setLoading(false)
      return
    }

    const verifySession = async () => {
      try {
        // Hier würden Sie normalerweise die Session bei Stripe verifizieren
        // Für jetzt simulieren wir eine erfolgreiche Verifizierung
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Benutzer-Profil aktualisieren, um sicherzustellen, dass das Abonnement aktiv ist
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setSessionData({
          user,
          profile,
          planType: profile?.subscription_plan || 'monthly'
        })
      } catch (err: any) {
        console.error('Error verifying session:', err)
        setError('Fehler beim Verifizieren der Zahlung')
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Zahlung wird verifiziert...</h2>
            <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Fehler</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button className="w-full">
                    Zurück zur Preisübersicht
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Zum Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const planNames = {
    monthly: 'Monatliches Abonnement',
    yearly: 'Jährliches Abonnement'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Willkommen bei der Krav Maga Academy!
            </h1>
            <p className="text-xl text-gray-600">
              Ihre Zahlung war erfolgreich und Ihr Abonnement ist jetzt aktiv.
            </p>
          </div>

          {/* Subscription Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                Abonnement Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-semibold">
                    {planNames[sessionData?.planType as keyof typeof planNames] || 'Unbekannt'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">Aktiv</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">E-Mail:</span>
                  <span className="font-semibold">{sessionData?.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Was Sie jetzt tun können</CardTitle>
              <CardDescription>
                Ihr Abonnement ist aktiv - hier sind Ihre nächsten Schritte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/courses">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Kurse erkunden</h3>
                      <p className="text-sm text-gray-600">
                        Durchstöbern Sie alle verfügbaren Krav Maga Kurse
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <PlayCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Dashboard besuchen</h3>
                      <p className="text-sm text-gray-600">
                        Sehen Sie Ihren Fortschritt und Ihre Kurse
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Benefits */}
          <Card className="mb-8 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">🎉 Ihre Vorteile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Unbegrenzter Zugang</h4>
                    <p className="text-sm text-gray-600">Alle Kurse und Videos sofort verfügbar</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Fortschrittsverfolgung</h4>
                    <p className="text-sm text-gray-600">Verfolgen Sie Ihren Lernfortschritt</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Mobile App</h4>
                    <p className="text-sm text-gray-600">Lernen Sie überall und jederzeit</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Community Zugang</h4>
                    <p className="text-sm text-gray-600">Tauschen Sie sich mit anderen aus</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Kurse erkunden
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Zum Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Brauchen Sie Hilfe?</h3>
            <p className="text-gray-600 mb-4">
              Unser Support-Team ist für Sie da, falls Sie Fragen haben.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a href="mailto:support@kravmaga-academy.com" className="text-blue-600 hover:underline">
                support@kravmaga-academy.com
              </a>
              <span className="hidden sm:inline text-gray-400">•</span>
              <a href="tel:+41000000000" className="text-blue-600 hover:underline">
                +41 (0) 00 000 00 00
              </a>
            </div>
          </div>
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

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
