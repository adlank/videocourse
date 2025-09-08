'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Vollständiger Name ist erforderlich')
      return false
    }
    if (!formData.email.trim()) {
      setError('E-Mail-Adresse ist erforderlich')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Gültige E-Mail-Adresse erforderlich')
      return false
    }
    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)

    try {
      // Benutzer registrieren
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Diese E-Mail-Adresse ist bereits registriert')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Registrierung fehlgeschlagen')
      }

      // Profil erstellen (falls nicht automatisch durch Trigger erstellt)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName.trim(),
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Nicht kritisch - könnte durch Trigger bereits erstellt worden sein
      }

      setSuccess(true)
      
      // Nach 3 Sekunden zur Bestätigungsseite weiterleiten
      setTimeout(() => {
        router.push('/auth/confirm?message=Bitte bestätigen Sie Ihre E-Mail-Adresse')
      }, 3000)

    } catch (err) {
      console.error('Registration error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4">Registrierung erfolgreich!</CardTitle>
            <CardDescription>
              Wir haben Ihnen eine Bestätigungs-E-Mail gesendet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-200 bg-green-50">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Bitte prüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Bestätigungslink, 
                um Ihr Konto zu aktivieren.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Weiterleitung zur Bestätigungsseite...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="mt-4">Konto erstellen</CardTitle>
          <CardDescription>
            Registrieren Sie sich für Ihre Krav Maga Kurse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vollständiger Name */}
            <div>
              <Label htmlFor="fullName">Vollständiger Name *</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Max Mustermann"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* E-Mail */}
            <div>
              <Label htmlFor="email">E-Mail-Adresse *</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@beispiel.de"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Passwort */}
            <div>
              <Label htmlFor="password">Passwort *</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mindestens 6 Zeichen"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Mindestens 6 Zeichen
              </p>
            </div>

            {/* Passwort bestätigen */}
            <div>
              <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrierung läuft...
                </div>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Konto erstellen
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Bereits registriert?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Jetzt anmelden
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Mit der Registrierung stimmen Sie unseren{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Nutzungsbedingungen
              </Link>{' '}
              und der{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Datenschutzerklärung
              </Link>{' '}
              zu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}