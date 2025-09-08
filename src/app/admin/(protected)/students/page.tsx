'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Users,
  Mail,
  Calendar,
  MoreHorizontal,
  UserCheck,
  UserX,
  AlertCircle,
  Crown,
  Activity,
  BookOpen,
  Clock
} from 'lucide-react'

interface Student {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_status?: string
  subscription_plan?: string
  subscription_current_period_end?: string
  is_admin: boolean
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  course_count?: number
  total_progress?: number
}

export default function StudentsPage() {
  const supabase = createClient()
  
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_course_progress(count),
          user_progress(progress_percentage)
        `)
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError

      const formattedStudents: Student[] = studentsData?.map(student => {
        const courseCount = student.user_course_progress?.length || 0
        const progressData = student.user_progress || []
        const totalProgress = progressData.length > 0 
          ? progressData.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) / progressData.length
          : 0

        return {
          ...student,
          course_count: courseCount,
          total_progress: Math.round(totalProgress)
        }
      }) || []

      setStudents(formattedStudents)
    } catch (err: any) {
      console.error('Error loading students:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Testphase</Badge>
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Überfällig</Badge>
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Gekündigt</Badge>
      default:
        return <Badge variant="outline">Kostenlos</Badge>
    }
  }

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'monthly':
        return <Badge variant="outline">Monatlich</Badge>
      case 'yearly':
        return <Badge variant="outline">Jährlich</Badge>
      default:
        return null
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && student.subscription_status === 'active') ||
      (filterStatus === 'inactive' && (!student.subscription_status || student.subscription_status === 'canceled')) ||
      (filterStatus === 'admins' && student.is_admin)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: students.length,
    active: students.filter(s => s.subscription_status === 'active').length,
    admins: students.filter(s => s.is_admin).length,
    thisMonth: students.filter(s => {
      const created = new Date(s.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Studenten</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Studenten</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Abos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administratoren</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diesen Monat</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Studenten durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Alle
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
          >
            Aktiv
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
          >
            Inaktiv
          </Button>
          <Button
            variant={filterStatus === 'admins' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('admins')}
          >
            Admins
          </Button>
        </div>
      </div>

      {/* Studenten-Liste */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Studenten gefunden' : 'Noch keine Studenten registriert'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Studenten werden hier angezeigt, sobald sie sich registrieren.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {student.avatar_url ? (
                        <img 
                          src={student.avatar_url} 
                          alt={student.full_name || student.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          {(student.full_name || student.email).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {student.full_name || 'Unbekannt'}
                        </h3>
                        {student.is_admin && (
                          <Crown className="h-4 w-4 text-purple-600" title="Administrator" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Registriert: {new Date(student.created_at).toLocaleDateString('de-DE')}
                        </div>
                        {student.last_sign_in_at && (
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            Letzter Login: {new Date(student.last_sign_in_at).toLocaleDateString('de-DE')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(student.subscription_status)}
                        {getPlanBadge(student.subscription_plan)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {student.course_count || 0} Kurse
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {student.total_progress || 0}% Fortschritt
                        </div>
                      </div>
                      
                      {student.subscription_current_period_end && (
                        <div className="text-xs text-gray-500">
                          Abo läuft ab: {new Date(student.subscription_current_period_end).toLocaleDateString('de-DE')}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
