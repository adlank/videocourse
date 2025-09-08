'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  BookOpen, 
  Play, 
  TrendingUp, 
  DollarSign,
  Clock,
  Award,
  Eye
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  activeSubscriptions: number
  totalCourses: number
  publishedCourses: number
  totalLessons: number
  totalVideoHours: number
  monthlyRevenue: number
  completionRate: number
  newStudentsThisMonth: number
  totalCertificatesIssued: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - später durch echte API-Calls ersetzen
    const mockStats: DashboardStats = {
      totalStudents: 247,
      activeSubscriptions: 189,
      totalCourses: 12,
      publishedCourses: 8,
      totalLessons: 156,
      totalVideoHours: 42,
      monthlyRevenue: 5670,
      completionRate: 73,
      newStudentsThisMonth: 23,
      totalCertificatesIssued: 89
    }
    
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="secondary" className="text-sm">
          Krav Maga Schule
        </Badge>
      </div>

      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Studenten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newStudentsThisMonth} diesen Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Abos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeSubscriptions / stats.totalStudents) * 100)}% Conversion Rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monatlicher Umsatz</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs. letzter Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittliche Kursabschlussrate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kurse</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCourses - stats.publishedCourses} Entwürfe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lektionen</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              Über alle Kurse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Stunden</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideoHours}h</div>
            <p className="text-xs text-muted-foreground">
              Gesamter Content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zertifikate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificatesIssued}</div>
            <p className="text-xs text-muted-foreground">
              Ausgestellt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schnellaktionen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Neueste Aktivitäten</CardTitle>
            <CardDescription>Letzte Aktionen Ihrer Studenten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Max Mustermann</p>
                <p className="text-xs text-muted-foreground">Hat "Grundlagen der Selbstverteidigung" abgeschlossen</p>
              </div>
              <p className="text-xs text-muted-foreground">vor 2h</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Anna Schmidt</p>
                <p className="text-xs text-muted-foreground">Neue Anmeldung - Jahresabo</p>
              </div>
              <p className="text-xs text-muted-foreground">vor 4h</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Peter Weber</p>
                <p className="text-xs text-muted-foreground">Frage gestellt in "Advanced Techniques"</p>
              </div>
              <p className="text-xs text-muted-foreground">vor 1d</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Kurse</CardTitle>
            <CardDescription>Ihre beliebtesten Kurse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Grundlagen der Selbstverteidigung</p>
                <p className="text-xs text-muted-foreground">156 Studenten</p>
              </div>
              <Badge variant="secondary">95% Rating</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Advanced Krav Maga Techniken</p>
                <p className="text-xs text-muted-foreground">89 Studenten</p>
              </div>
              <Badge variant="secondary">92% Rating</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mentale Stärke & Selbstvertrauen</p>
                <p className="text-xs text-muted-foreground">67 Studenten</p>
              </div>
              <Badge variant="secondary">98% Rating</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
