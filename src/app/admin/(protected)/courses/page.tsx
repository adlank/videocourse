'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Users, 
  Clock,
  Play,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { Course } from '@/types/database.types'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CourseWithStats extends Course {
  lessons_count?: number
  students_count?: number
  average_progress?: number
  course_categories?: {
    id: string
    name: string
  }
}

const levelLabels = {
  beginner: 'Anfänger',
  intermediate: 'Fortgeschritten',
  advanced: 'Experte',
  all_levels: 'Alle Level'
}

const levelColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
  all_levels: 'bg-blue-100 text-blue-800'
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/courses')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Kurse')
      }
      
      setCourses(data.courses || [])
    } catch (err) {
      console.error('Fehler beim Laden der Kurse:', err)
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kurs löschen möchten?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen des Kurses')
      }

      // Kurse neu laden
      loadCourses()
    } catch (err) {
      console.error('Fehler beim Löschen des Kurses:', err)
      alert(err instanceof Error ? err.message : 'Fehler beim Löschen des Kurses')
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kurse</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kurs
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="aspect-video bg-gray-200 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Kurse</h1>
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kurs
            </Button>
          </Link>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCourses}
              className="ml-4"
            >
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kurse</h1>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kurs
          </Button>
        </Link>
      </div>

      {/* Suchleiste */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Kurse durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.is_published).length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entwürfe</p>
                <p className="text-2xl font-bold">{courses.filter(c => !c.is_published).length}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.is_featured).length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kursliste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img
                src={course.thumbnail_url || '/api/placeholder/400/225'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {course.is_featured && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Featured
                  </Badge>
                )}
                <Badge 
                  variant={course.is_published ? "default" : "secondary"}
                  className={course.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                >
                  {course.is_published ? 'Live' : 'Entwurf'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.short_description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <Badge 
                    variant="outline" 
                    className={levelColors[course.level]}
                  >
                    {levelLabels[course.level]}
                  </Badge>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                  </div>
                </div>

                {course.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Fortschritt</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-3 w-3" />
                    <span>{course.students_count || 0} Studenten</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="ghost" size="sm" title="Bearbeiten">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Vorschau">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      title="Löschen"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Play className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Kurse gefunden' : 'Noch keine Kurse erstellt'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Erstelle deinen ersten Krav Maga Kurs.'
            }
          </p>
          {!searchTerm && (
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Kurs erstellen
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
