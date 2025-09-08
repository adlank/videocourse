'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    // Check if user is already logged in and is admin
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        if (profile?.is_admin) {
          router.push('/admin/dashboard')
          return
        }
      }
    }
    
    checkAdminStatus()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { email, password: '***' })
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Auth result:', { authData, authError })

      if (authError) {
        console.error('Auth error details:', authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('Login fehlgeschlagen')
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, full_name')
        .eq('id', authData.user.id)
        .single()

      console.log('Profile check result:', { profile, profileError, userId: authData.user.id })

      if (profileError) {
        console.error('Profile error details:', profileError)
        
        // If profile doesn't exist, try to create one for your admin email
        if (profileError.code === 'PGRST116' && authData.user.email === 'adlan.khatsuev@outlook.com') {
          console.log('Creating admin profile for:', authData.user.email)
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: authData.user.email,
              full_name: 'Adlan Khatsuev',
              is_admin: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            console.error('Failed to create admin profile:', createError)
            throw new Error('Konnte Admin-Profil nicht erstellen: ' + createError.message)
          }

          console.log('Admin profile created successfully:', newProfile)
        } else {
          throw new Error('Profil konnte nicht geladen werden: ' + profileError.message)
        }
      } else if (!profile?.is_admin) {
        console.error('User is not admin:', profile)
        // Sign out if not admin
        await supabase.auth.signOut()
        throw new Error('Keine Admin-Berechtigung. Nur Administratoren können sich hier anmelden.')
      }

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
      
    } catch (err: unknown) {
      console.error('Admin login error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createAdminAccount = async () => {
    // Development helper - creates admin account directly
    try {
      // First try to sign up the admin user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@kravmaga.com',
        password: 'admin123',
        options: {
          data: {
            full_name: 'Krav Maga Administrator'
          }
        }
      })

      if (signUpError) {
        // If user already exists, try to make them admin
        console.log('User might already exist, trying to make admin...')
        
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@kravmaga.com',
          password: 'admin123'
        })

        if (!signInError && signInData.user) {
          // Make user admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', signInData.user.id)

          if (updateError) {
            throw updateError
          }

          await supabase.auth.signOut()
          alert('Admin-Status hinzugefügt! Bitte erneut anmelden.')
        } else {
          throw new Error('Konnte Admin-Account nicht erstellen oder finden')
        }
      } else if (authData.user) {
        // New user created, make them admin
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'admin@kravmaga.com',
            full_name: 'Krav Maga Administrator',
            is_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile error:', profileError)
        }

        alert('Admin-Account erstellt! Sie können sich jetzt anmelden.')
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error creating admin:', error)
      alert('Fehler beim Erstellen des Admin-Accounts: ' + (error as Error).message)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin-Anmeldung</CardTitle>
            <CardDescription>
              Melden Sie sich mit Ihren Administrator-Zugangsdaten an
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
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kravmaga.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    }
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Anmeldung läuft...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Als Administrator anmelden
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/auth/reset-password" 
                className="text-sm text-blue-600 hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>

            {/* Development Helper */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-6 border-t">
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Development Mode</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={createAdminAccount}
                    className="text-xs"
                  >
                    Aktuellen User zu Admin machen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 mb-1">
                  Sicherheitshinweis
                </h4>
                <p className="text-xs text-amber-700">
                  Diese Anmeldung ist nur für autorisierte Administratoren bestimmt. 
                  Alle Anmeldeversuche werden protokolliert.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access for Development */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Development Quick Access
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEmail('adlan.khatsuev@outlook.com')
                      setPassword('') // Ihr echtes Passwort hier eingeben
                    }}
                  >
                    Adlan Admin
                  </Button>
                  <Link href="/register">
                    <Button variant="outline" size="sm" className="w-full">
                      Account erstellen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
