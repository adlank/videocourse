'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { formatDuration } from '@/lib/utils'

export default function CourseDetailPage() {
  const [course, setCourse] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const loadCourseAndProgress = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Load course details via API (bypasses RLS issues)
        const response = await fetch(`/api/courses/${params.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          console.error('Error loading course:', data.error)
          return
        }
        
        const courseData = data.course

        // Sort sections and lessons by order
        if (courseData.course_sections) {
          courseData.course_sections.sort((a: any, b: any) => a.sort_order - b.sort_order)
          courseData.course_sections.forEach((section: any) => {
            if (section.course_lessons) {
              section.course_lessons.sort((a: any, b: any) => a.sort_order - b.sort_order)
            }
          })
        }

        setCourse(courseData)

        // Debug: Log course data
        console.log('Loaded course data:', courseData)
        console.log('Course sections:', courseData.course_sections)
        courseData.course_sections?.forEach((section: any, index: number) => {
          console.log(`Section ${index + 1}: ${section.title}`, section.course_lessons)
        })

        // Load user progress if logged in
        if (user) {
          const allLessons = courseData.course_sections?.flatMap((section: any) => section.course_lessons || []) || []
          const lessonIds = allLessons.map((lesson: any) => lesson.id)
          
          if (lessonIds.length > 0) {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('*')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds)

            setUserProgress(progressData || [])
          }
        }
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCourseAndProgress()
    }
  }, [params.id, supabase])

  const levelLabels = {
    beginner: 'Anfänger',
    intermediate: 'Fortgeschritten',
    advanced: 'Experte'
  }

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  }

  const getProgressForLesson = (lessonId: string) => {
    return userProgress.find(p => p.lesson_id === lessonId)
  }

  const getAllLessons = () => {
    if (!course?.course_sections) return []
    return course.course_sections.flatMap((section: any) => section.course_lessons || [])
  }

  const calculateCourseProgress = () => {
    const allLessons = getAllLessons()
    if (!allLessons.length || !user) return 0
    
    const completedLessons = allLessons.filter((lesson: any) => {
      const progress = getProgressForLesson(lesson.id)
      return progress?.completed
    }).length
    
    return Math.round((completedLessons / allLessons.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Lade Kurs...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Kurs nicht gefunden</h1>
            <Link href="/courses">
              <Button>Zurück zu den Kursen</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge 
                  variant="secondary" 
                  className={`${levelColors[course.level as keyof typeof levelColors]}`}
                >
                  {levelLabels[course.level as keyof typeof levelLabels]}
                </Badge>
                {course.course_categories && (
                  <Badge variant="outline">
                    {course.course_categories.name}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              
              {course.description && (
                <p className="text-gray-600 text-lg mb-6">
                  {course.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                {course.profiles && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.profiles.full_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(course.duration_minutes * 60)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{getAllLessons().length} Lektionen</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Dein Fortschritt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Abgeschlossen</span>
                      <span>{Math.round(calculateCourseProgress())}%</span>
                    </div>
                    <Progress value={calculateCourseProgress()} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle>Kursinhalt</CardTitle>
                <CardDescription>
                  {course.course_sections?.length || 0} Sektionen • {getAllLessons().length} Lektionen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.course_sections?.map((section: any, sectionIndex: number) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                    )}
                    <div className="space-y-2">
                      {!section.course_lessons || section.course_lessons.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm">Noch keine Lektionen in dieser Sektion</p>
                          <p className="text-xs text-gray-500 mt-1">Lektionen werden bald hinzugefügt</p>
                        </div>
                      ) : (
                        section.course_lessons.map((lesson: any, lessonIndex: number) => {
                        const progress = getProgressForLesson(lesson.id)
                        const isCompleted = progress?.completed
                        const canAccess = user && (lesson.is_preview || true) // In real app, check membership
                        const globalLessonIndex = getAllLessons().findIndex((l: any) => l.id === lesson.id) + 1

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                                    {globalLessonIndex}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{lesson.title}</h4>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">
                                {formatDuration(lesson.video_duration_seconds || 0)}
                              </span>
                              {lesson.is_preview && (
                                <Badge variant="secondary" className="text-xs">
                                  Kostenlos
                                </Badge>
                              )}
                              {canAccess ? (
                                <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                                  <Button size="sm" variant="outline">
                                    {isCompleted ? 'Wiederholen' : 'Starten'}
                                  </Button>
                                </Link>
                              ) : (
                                <Button size="sm" variant="outline" disabled>
                                  Gesperrt
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                        })
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Kurs starten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Du hast Zugang zu diesem Kurs mit deiner aktuellen Mitgliedschaft.
                    </p>
                    {course.course_lessons && course.course_lessons.length > 0 && (
                      <Link href={`/courses/${course.id}/lessons/${course.course_lessons[0].id}`}>
                        <Button className="w-full">
                          {calculateCourseProgress() > 0 ? 'Weiter lernen' : 'Kurs starten'}
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Melde dich an, um Zugang zu diesem Kurs zu erhalten.
                    </p>
                    <div className="space-y-2">
                      <Link href="/register">
                        <Button className="w-full">
                          Registrieren
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Anmelden
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Kurs-Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Level:</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${levelColors[course.level as keyof typeof levelColors]}`}
                  >
                    {levelLabels[course.level as keyof typeof levelLabels]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lektionen:</span>
                  <span className="text-sm font-medium">{course.course_lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gesamtdauer:</span>
                  <span className="text-sm font-medium">{formatDuration(course.duration_minutes * 60)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kategorie:</span>
                  <span className="text-sm font-medium">{course.course_categories?.name}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}