'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  BookOpen, 
  Play, 
  Clock, 
  Trophy, 
  Target,
  TrendingUp,
  Star,
  ChevronRight,
  User,
  Calendar,
  Award,
  Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string
  created_at: string
}

interface Course {
  id: string
  title: string
  short_description: string
  thumbnail_url?: string
  level: string
  duration_minutes: number
  is_featured: boolean
  course_categories: {
    name: string
  }
}

interface UserProgress {
  course_id: string
  progress_percentage: number
  last_accessed_at: string
  completed_lessons: number
  total_lessons: number
}

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  totalWatchTime: number
  currentStreak: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalWatchTime: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        throw new Error('Nicht authentifiziert')
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        throw new Error('Profil konnte nicht geladen werden')
      }

      setUser(profile)

      // Get published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          short_description,
          thumbnail_url,
          level,
          duration_minutes,
          is_featured,
          course_categories (
            name
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (coursesError) {
        throw new Error('Kurse konnten nicht geladen werden')
      }

      setCourses(coursesData || [])

      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authUser.id)

      if (progressError) {
        console.error('Progress loading error:', progressError)
      } else {
        setUserProgress(progressData || [])
      }

      // Calculate stats
      const totalCourses = coursesData?.length || 0
      const completedCourses = progressData?.filter(p => p.progress_percentage >= 100).length || 0
      const totalWatchTime = progressData?.reduce((sum, p) => sum + (p.total_watch_time || 0), 0) || 0

      setStats({
        totalCourses,
        completedCourses,
        totalWatchTime: Math.floor(totalWatchTime / 60), // Convert to minutes
        currentStreak: 7 // Mock data for now
      })

    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Dashboards')
    } finally {
      setLoading(false)
    }
  }

  const getCourseProgress = (courseId: string) => {
    return userProgress.find(p => p.course_id === courseId)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Anfänger'
      case 'intermediate': return 'Fortgeschritten'
      case 'advanced': return 'Experte'
      case 'all_levels': return 'Alle Level'
      default: return level
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zurück, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Setzen Sie Ihr Krav Maga Training fort und erreichen Sie Ihre Ziele.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verfügbare Kurse</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abgeschlossene Kurse</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lernzeit gesamt</p>
                  <p className="text-3xl font-bold text-gray-900">{formatTime(stats.totalWatchTime)}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktuelle Serie</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} Tage</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Lernen fortsetzen</h2>
                <Link href="/courses">
                  <Button variant="outline" size="sm">
                    Alle Kurse
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => {
                  const progress = getCourseProgress(course.id)
                  return (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {course.thumbnail_url ? (
                                <img
                                  src={course.thumbnail_url}
                                  alt={course.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Play className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {course.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {course.short_description}
                                </p>
                                <div className="flex items-center space-x-3">
                                  <Badge className={getLevelColor(course.level)}>
                                    {getLevelLabel(course.level)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {course.course_categories.name}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {formatTime(course.duration_minutes)}
                                  </span>
                                </div>
                              </div>
                              {course.is_featured && (
                                <Badge variant="outline" className="border-yellow-200 text-yellow-600">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            
                            {progress && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600">Fortschritt</span>
                                  <span className="font-medium">{progress.progress_percentage}%</span>
                                </div>
                                <Progress value={progress.progress_percentage} className="h-2" />
                              </div>
                            )}
                            
                            <div className="mt-4">
                              <Link href={`/courses/${course.id}`}>
                                <Button className="w-full sm:w-auto">
                                  {progress ? 'Fortsetzen' : 'Beginnen'}
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Lernziele
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Wöchentliches Ziel</span>
                    <span className="text-sm font-medium">3/5 Lektionen</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monatliches Ziel</span>
                    <span className="text-sm font-medium">8/20 Stunden</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Erfolge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Erste Lektion abgeschlossen</p>
                      <p className="text-xs text-gray-500">Vor 2 Tagen</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">7 Tage in Folge</p>
                      <p className="text-xs text-gray-500">Heute</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Schnellzugriff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/courses" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Alle Kurse durchsuchen
                  </Button>
                </Link>
                <Link href="/my-progress" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Mein Fortschritt
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Profil bearbeiten
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}