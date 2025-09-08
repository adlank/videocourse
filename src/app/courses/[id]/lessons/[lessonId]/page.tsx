'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import VideoPlayer from '@/components/video/video-player'
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen,
  Clock,
  CheckCircle,
  PlayCircle,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Lesson {
  id: string
  title: string
  description?: string
  video_url: string
  video_duration_seconds: number
  thumbnail_url?: string
  sort_order: number
  is_preview: boolean
  has_quiz?: boolean
  resources?: any[]
}

interface Section {
  id: string
  title: string
  description?: string
  sort_order: number
  course_lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description?: string
  level: string
  instructor_name: string
  course_sections: Section[]
}

interface UserProgress {
  current_time_seconds: number
  progress_percentage: number
  total_watch_time: number
  completed: boolean
}

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string
  const lessonId = params?.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [showHTML5Test, setShowHTML5Test] = useState(false)
  // HTML5 Player is now the default and only player

  const supabase = createClient()

  // Global error handler for video player issues
  const handleVideoError = (errorMessage: string) => {
    console.error('Video Player Error:', errorMessage)
    setPlayerError(errorMessage)
  }

  useEffect(() => {
    if (courseId && lessonId) {
      loadLessonData()
    }
  }, [courseId, lessonId])

  const loadLessonData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Load lesson data via API (bypasses RLS issues)
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Lektion')
      }

      const courseData = data.course
      const lesson = data.lesson
      const allCourseLessons = data.allLessons
      const lessonIndex = data.lessonIndex
      const hasLessonAccess = data.hasAccess // Always true for testing

      // Load user progress for this lesson
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()

      setCourse(courseData)
      setCurrentLesson(lesson)
      setAllLessons(allCourseLessons)
      setCurrentLessonIndex(lessonIndex)
      setUserProgress(progressData)
      setHasAccess(hasLessonAccess)

    } catch (err) {
      console.error('Error loading lesson:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Lektion')
    } finally {
      setLoading(false)
    }
  }

  const handleProgressUpdate = (progress: number) => {
    setUserProgress(prev => prev ? { ...prev, progress_percentage: progress } : null)
  }

  const handleLessonComplete = () => {
    setUserProgress(prev => prev ? { ...prev, completed: true, progress_percentage: 100 } : null)
    
    // Auto-advance to next lesson after 3 seconds
    setTimeout(() => {
      goToNextLesson()
    }, 3000)
  }

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const previousLesson = allLessons[currentLessonIndex - 1]
      router.push(`/courses/${courseId}/lessons/${previousLesson.id}`)
    }
  }

  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1]
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getLevelLabel = (level: string) => {
    const labels = {
      beginner: 'Anfänger',
      intermediate: 'Fortgeschritten',
      advanced: 'Experte',
      all_levels: 'Alle Level'
    }
    return labels[level as keyof typeof labels] || level
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Lektion nicht gefunden'}
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline" size="sm" className="ml-4">
                Zurück zum Kurs
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Access denied for non-preview lessons
  if (!hasAccess && !currentLesson.is_preview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mitgliedschaft erforderlich
              </h2>
              <p className="text-gray-600 mb-6">
                Diese Lektion ist nur für Mitglieder verfügbar. Werden Sie Mitglied, um Zugriff auf alle Kurse zu erhalten.
              </p>
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button size="lg" className="w-full sm:w-auto">
                    Mitglied werden
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Zurück zum Kurs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/courses" className="hover:text-gray-900">Kurse</Link>
          <span>/</span>
          <Link href={`/courses/${courseId}`} className="hover:text-gray-900">{course.title}</Link>
          <span>/</span>
          <span className="text-gray-900">{currentLesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            <div className="mb-6">
              {currentLesson.video_url ? (
                <>
                  {playerError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {playerError}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => {
                            setPlayerError(null)
                            window.location.reload()
                          }}
                        >
                          Seite neu laden
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Debug Info */}
                  <div className="mb-2 text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded">
                    <div>Player: ReactPlayer (Enhanced)</div>
                    <div>Video URL: {currentLesson.video_url ? '✅ Verfügbar' : '❌ Nicht verfügbar'}</div>
                    <div>Thumbnail: {currentLesson.thumbnail_url ? '✅ Verfügbar' : '❌ Nicht verfügbar'}</div>
                    <div>Duration: {currentLesson.video_duration_seconds || 0}s</div>
                    {currentLesson.video_url && (
                      <div className="text-xs bg-white p-1 rounded mt-1">
                        <strong>Video:</strong> {currentLesson.video_url.substring(0, 50)}...
                      </div>
                    )}
                    {currentLesson.thumbnail_url && (
                      <div className="text-xs bg-white p-1 rounded mt-1">
                        <strong>Thumb:</strong> {currentLesson.thumbnail_url.substring(0, 50)}...
                      </div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const response = await fetch(`/api/debug/lesson/${lessonId}`)
                          const data = await response.json()
                          console.log('Lesson Debug Data:', data)
                          alert('Debug-Daten in Console geloggt')
                        }}
                      >
                        Debug Lesson
                      </Button>
                      {currentLesson.video_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            const response = await fetch('/api/debug/test-storage-url', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: currentLesson.video_url })
                            })
                            const data = await response.json()
                            console.log('Video URL Test:', data)
                            alert(`Video URL ${data.accessible ? '✅ Zugänglich' : '❌ Nicht zugänglich'} (Status: ${data.status})`)
                          }}
                        >
                          Test Video URL
                        </Button>
                      )}
                      {currentLesson.thumbnail_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            const response = await fetch('/api/debug/test-storage-url', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: currentLesson.thumbnail_url })
                            })
                            const data = await response.json()
                            console.log('Thumbnail URL Test:', data)
                            alert(`Thumbnail URL ${data.accessible ? '✅ Zugänglich' : '❌ Nicht zugänglich'} (Status: ${data.status})`)
                          }}
                        >
                          Test Thumbnail URL
                        </Button>
                      )}
                      {!currentLesson.video_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            const response = await fetch('/api/debug/add-test-video', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ lessonId })
                            })
                            const data = await response.json()
                            if (data.success) {
                              alert('Test-Video hinzugefügt! Seite wird neu geladen...')
                              window.location.reload()
                            } else {
                              alert('Fehler: ' + data.error)
                            }
                          }}
                        >
                          Test-Video hinzufügen
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <VideoPlayer
                    lessonId={lessonId}
                    courseId={courseId}
                    videoUrl={currentLesson.video_url}
                    thumbnailUrl={currentLesson.thumbnail_url}
                    title={currentLesson.title}
                    duration={currentLesson.video_duration_seconds}
                    onProgress={handleProgressUpdate}
                    onComplete={handleLessonComplete}
                    startTime={userProgress?.current_time_seconds || 0}
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Video noch nicht verfügbar
                    </h3>
                    <p className="text-gray-600">
                      Das Video für diese Lektion wird bald hinzugefügt.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Lektion {currentLessonIndex + 1} von {allLessons.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentLesson.is_preview && (
                      <Badge variant="outline" className="border-green-200 text-green-600">
                        Kostenlose Vorschau
                      </Badge>
                    )}
                    {userProgress?.completed && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Abgeschlossen
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(currentLesson.video_duration_seconds)}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {getLevelLabel(course.level)}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.instructor_name}
                  </div>
                </div>

                {currentLesson.description && (
                  <div className="prose max-w-none">
                    <p>{currentLesson.description}</p>
                  </div>
                )}

                {/* Progress */}
                {userProgress && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Ihr Fortschritt</span>
                      <span className="text-sm text-gray-600">{userProgress.progress_percentage}%</span>
                    </div>
                    <Progress value={userProgress.progress_percentage} className="h-2" />
                    {userProgress.total_watch_time > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Angeschaut: {Math.floor(userProgress.total_watch_time / 60)} Minuten
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Vorherige Lektion
              </Button>
              
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost">
                  Zurück zum Kurs
                </Button>
              </Link>

              <Button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === allLessons.length - 1}
              >
                Nächste Lektion
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kurs-Inhalt</CardTitle>
                <CardDescription>
                  {allLessons.length} Lektionen
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {course.course_sections.map((section) => (
                    <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="p-4 bg-gray-50">
                        <h4 className="font-medium text-sm">{section.title}</h4>
                      </div>
                      <div className="space-y-1">
                        {section.course_lessons.map((lesson, index) => (
                          <Link
                            key={lesson.id}
                            href={`/courses/${courseId}/lessons/${lesson.id}`}
                            className={`block p-3 hover:bg-gray-50 transition-colors ${
                              lesson.id === lessonId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {userProgress && lesson.id === lessonId && userProgress.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm font-medium truncate ${
                                    lesson.id === lessonId ? 'text-blue-600' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {formatDuration(lesson.video_duration_seconds)}
                                    </span>
                                    {lesson.is_preview && (
                                      <Badge variant="outline" className="text-xs py-0 px-1">
                                        Vorschau
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}