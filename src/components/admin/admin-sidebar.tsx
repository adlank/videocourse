'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Video, 
  FolderOpen,
  MessageSquare,
  Trophy,
  CreditCard,
  LogOut,
  User
} from 'lucide-react'

interface AdminProfile {
  full_name: string | null
  email: string
  avatar_url: string | null
}

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3
  },
  {
    title: 'Kurse',
    href: '/admin/courses',
    icon: BookOpen
  },
  {
    title: 'Kategorien',
    href: '/admin/categories',
    icon: FolderOpen
  },
  {
    title: 'Videos',
    href: '/admin/videos',
    icon: Video
  },
  {
    title: 'Studenten',
    href: '/admin/students',
    icon: Users
  },
  {
    title: 'Abonnements',
    href: '/admin/subscriptions',
    icon: CreditCard
  },
  {
    title: 'Q&A',
    href: '/admin/qa',
    icon: MessageSquare
  },
  {
    title: 'Zertifikate',
    href: '/admin/certificates',
    icon: Trophy
  },
  {
    title: 'Einstellungen',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)

  useEffect(() => {
    const getAdminProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setAdminProfile(profile)
          }
        }
      } catch (error) {
        console.error('Error loading admin profile:', error)
      }
    }

    getAdminProfile()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Krav Maga Admin</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-800',
                isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-800 p-4 space-y-4">
        {/* Admin Profile */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
            {adminProfile?.avatar_url ? (
              <img
                src={adminProfile.avatar_url}
                alt="Admin Avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {adminProfile ? getInitials(adminProfile.full_name, adminProfile.email) : 'KM'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {adminProfile?.full_name || 'Krav Maga Expert'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {adminProfile?.email || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-2">
          <Link href="/admin/profile">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <User className="mr-2 h-4 w-4" />
              Profil
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="pt-2 border-t border-gray-800">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-400 hover:text-gray-300"
            >
              Zur Website →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
