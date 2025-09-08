import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Kurse Platform</h3>
            <p className="text-sm text-muted-foreground">
              Lerne mit unseren professionellen Video-Kursen und erweitere deine Fähigkeiten.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Kurse</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-muted-foreground hover:text-foreground">
                  Alle Kurse
                </Link>
              </li>
              <li>
                <Link href="/courses?level=beginner" className="text-muted-foreground hover:text-foreground">
                  Anfänger
                </Link>
              </li>
              <li>
                <Link href="/courses?level=advanced" className="text-muted-foreground hover:text-foreground">
                  Fortgeschritten
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/my-progress" className="text-muted-foreground hover:text-foreground">
                  Mein Fortschritt
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground">
                  Einstellungen
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Hilfe
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Video Kurse Platform. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  )
}