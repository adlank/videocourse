'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Edit,
  Trash2,
  Video,
  Clock,
  Users,
  PlayCircle,
  AlertCircle,
  GripVertical,
  Upload,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '@/components/admin/file-upload'

interface Course {
  id: string
  title: string
  short_description: string
  description: string
  level: string
  category_id: string
  thumbnail_url?: string
  trailer_video_url?: string
  what_you_learn: string[]
  requirements: string[]
  target_audience: string[]
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  course_sections: Section[]
}

interface Section {
  id: string
  title: string
  description?: string
  sort_order: number
  course_lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description?: string
  video_url: string
  video_duration_seconds: number
  thumbnail_url?: string
  sort_order: number
  is_preview: boolean
  has_quiz: boolean
  resources: any[]
}

interface NewLessonData {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  is_preview: boolean
  section_id: string
}

interface NewSectionData {
  title: string
  description: string
}

export default function CourseEditPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [newSectionDialog, setNewSectionDialog] = useState(false)
  const [newLessonDialog, setNewLessonDialog] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
  
  // Form states
  const [newSectionData, setNewSectionData] = useState<NewSectionData>({
    title: '',
    description: ''
  })
  
  const [newLessonData, setNewLessonData] = useState<NewLessonData>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    is_preview: false,
    section_id: ''
  })

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/courses/${courseId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden des Kurses')
      }
      
      setCourse(data.course)
    } catch (err) {
      console.error('Fehler beim Laden des Kurses:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Kurses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSection = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/courses/${courseId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSectionData.title,
          description: newSectionData.description,
          sort_order: (course?.course_sections.length || 0) + 1
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Sektion')
      }

      // Kurs neu laden
      await loadCourse()
      
      // Dialog schließen und Form zurücksetzen
      setNewSectionDialog(false)
      setNewSectionData({ title: '', description: '' })
      
    } catch (err) {
      console.error('Fehler beim Erstellen der Sektion:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Sektion')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLesson = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLessonData,
          sort_order: getNextLessonOrder(newLessonData.section_id)
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Lektion')
      }

      // Kurs neu laden
      await loadCourse()
      
      // Dialog schließen und Form zurücksetzen
      setNewLessonDialog(false)
      setNewLessonData({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        is_preview: false,
        section_id: ''
      })
      
    } catch (err) {
      console.error('Fehler beim Erstellen der Lektion:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Lektion')
    } finally {
      setSaving(false)
    }
  }

  const getNextLessonOrder = (sectionId: string): number => {
    const section = course?.course_sections.find(s => s.id === sectionId)
    return (section?.course_lessons.length || 0) + 1
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Lektion löschen möchten?')) return
    
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen der Lektion')
      }
      
      await loadCourse()
    } catch (err) {
      console.error('Fehler beim Löschen der Lektion:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Lektion')
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Sektion löschen möchten? Alle Lektionen werden ebenfalls gelöscht.')) return
    
    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen der Sektion')
      }
      
      await loadCourse()
    } catch (err) {
      console.error('Fehler beim Löschen der Sektion:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Sektion')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Kurs...</p>
        </div>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Kurs bearbeiten</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-600 mt-1">Kurs bearbeiten</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href={`/courses/${course.id}`} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Vorschau
            </Button>
          </Link>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kurs-Informationen</span>
            <Badge variant={course.is_published ? "default" : "secondary"}>
              {course.is_published ? 'Veröffentlicht' : 'Entwurf'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Level:</span> {course.level}
            </div>
            <div>
              <span className="font-medium">Lektionen:</span> {course.course_sections.reduce((total, section) => total + section.course_lessons.length, 0)}
            </div>
            <div>
              <span className="font-medium">Erstellt:</span> {new Date(course.created_at).toLocaleDateString('de-DE')}
            </div>
            <div>
              <span className="font-medium">Zuletzt bearbeitet:</span> {new Date(course.updated_at).toLocaleDateString('de-DE')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Sections and Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kurs-Inhalte</span>
            <Button onClick={() => setNewSectionDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Sektion hinzufügen
            </Button>
          </CardTitle>
          <CardDescription>
            Organisieren Sie Ihre Lektionen in Sektionen für eine bessere Struktur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {course.course_sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Video className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Noch keine Inhalte</p>
              <p className="text-sm mb-4">Fügen Sie Sektionen und Lektionen hinzu, um Ihren Kurs zu strukturieren.</p>
              <Button onClick={() => setNewSectionDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Erste Sektion erstellen
              </Button>
            </div>
          ) : (
            course.course_sections
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((section, sectionIndex) => (
                <div key={section.id} className="border rounded-lg p-4">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-lg">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-gray-600">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSectionId(section.id)
                          setNewLessonData(prev => ({ ...prev, section_id: section.id }))
                          setNewLessonDialog(true)
                        }}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Lektion hinzufügen
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2 ml-8">
                    {section.course_lessons.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm">Noch keine Lektionen</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedSectionId(section.id)
                            setNewLessonData(prev => ({ ...prev, section_id: section.id }))
                            setNewLessonDialog(true)
                          }}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Lektion hinzufügen
                        </Button>
                      </div>
                    ) : (
                      section.course_lessons
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <GripVertical className="h-3 w-3 text-gray-400" />
                              <PlayCircle className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{lesson.title}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {formatDuration(lesson.video_duration_seconds)}
                                  </span>
                                  {lesson.is_preview && (
                                    <Badge variant="outline" className="text-xs">
                                      Kostenlose Vorschau
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>

      {/* New Section Dialog */}
      <Dialog open={newSectionDialog} onOpenChange={setNewSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Sektion erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie eine neue Sektion, um Ihre Lektionen zu organisieren.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title">Titel</Label>
              <Input
                id="section-title"
                value={newSectionData.title}
                onChange={(e) => setNewSectionData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Grundlagen der Selbstverteidigung"
              />
            </div>
            <div>
              <Label htmlFor="section-description">Beschreibung (optional)</Label>
              <Textarea
                id="section-description"
                value={newSectionData.description}
                onChange={(e) => setNewSectionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung der Sektion..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSectionDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddSection} 
              disabled={!newSectionData.title.trim() || saving}
            >
              {saving ? 'Erstelle...' : 'Sektion erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Lesson Dialog */}
      <Dialog open={newLessonDialog} onOpenChange={setNewLessonDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Lektion erstellen</DialogTitle>
            <DialogDescription>
              Fügen Sie eine neue Lektion zu Ihrem Kurs hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="lesson-title">Titel</Label>
              <Input
                id="lesson-title"
                value={newLessonData.title}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Grundhaltung und Beinarbeit"
              />
            </div>
            
            <div>
              <Label htmlFor="lesson-description">Beschreibung</Label>
              <Textarea
                id="lesson-description"
                value={newLessonData.description}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Was lernen die Schüler in dieser Lektion?"
              />
            </div>

            <div>
              <Label>Sektion</Label>
              <Select
                value={newLessonData.section_id}
                onValueChange={(value) => setNewLessonData(prev => ({ ...prev, section_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektion auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {course.course_sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lektions-Video</Label>
              <FileUpload
                bucket="videos"
                accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                maxSize={2048} // 2GB in MB
                onUploadComplete={(url) => setNewLessonData(prev => ({ ...prev, video_url: url }))}
                className="mt-2"
                description="Kurzer Vorschau-Clip für den Kurs"
              />
              {newLessonData.video_url && (
                <p className="text-sm text-green-600 mt-2">✓ Video hochgeladen</p>
              )}
            </div>

            <div>
              <Label>Lektions-Thumbnail (optional)</Label>
              <FileUpload
                bucket="thumbnails"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                maxSize={5} // 5MB
                onUploadComplete={(url) => setNewLessonData(prev => ({ ...prev, thumbnail_url: url }))}
                className="mt-2"
                description="Empfohlen: 1280×720px, JPG oder PNG"
              />
              {newLessonData.thumbnail_url && (
                <p className="text-sm text-green-600 mt-2">✓ Thumbnail hochgeladen</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-preview"
                checked={newLessonData.is_preview}
                onChange={(e) => setNewLessonData(prev => ({ ...prev, is_preview: e.target.checked }))}
              />
              <Label htmlFor="is-preview">Als kostenlose Vorschau markieren</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewLessonDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddLesson} 
              disabled={!newLessonData.title.trim() || !newLessonData.video_url || !newLessonData.section_id || saving}
            >
              {saving ? 'Erstelle...' : 'Lektion erstellen'}
            </Button>
            {!newLessonData.section_id && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Bitte wählen Sie eine Sektion aus
              </p>
            )}
            {!newLessonData.video_url && newLessonData.title && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Bitte laden Sie ein Video hoch
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}