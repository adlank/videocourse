'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Verhindere Hydration-Fehler
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Video Kurse</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-sm font-medium hover:text-primary">
              Kurse
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-20 animate-pulse bg-gray-200 rounded" />
          </div>
        </div>
      </header>
    )
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Video Kurse</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/courses" className="text-sm font-medium hover:text-primary">
            Kurse
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/my-progress" className="text-sm font-medium hover:text-primary">
                Mein Fortschritt
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-2" suppressHydrationWarning>
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-gray-200 rounded" />
          ) : user ? (
            <div className="flex items-center space-x-2">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Einstellungen
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Abmelden
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Registrieren
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  Admin
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}