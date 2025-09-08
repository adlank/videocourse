'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { VideoUpload } from './video-upload'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  PlayCircle,
  Clock,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description?: string
  video_url?: string
  duration_minutes: number
  sort_order: number
  is_preview: boolean
}

interface Section {
  id: string
  title: string
  description?: string
  sort_order: number
  course_lessons: Lesson[]
}

interface LessonManagerProps {
  courseId: string
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
}

interface EditingLesson {
  sectionId: string
  lessonId?: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  is_preview: boolean
}

export function LessonManager({ courseId, sections, onSectionsChange }: LessonManagerProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Alle Sektionen standardmäßig erweitern
  useEffect(() => {
    setExpandedSections(new Set(sections.map(s => s.id)))
  }, [sections])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const addSection = async () => {
    if (!newSectionTitle.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          title: newSectionTitle.trim(),
          sort_order: sections.length + 1
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen der Sektion')
      }

      // Neue Sektion zu den bestehenden hinzufügen
      const newSection: Section = {
        id: data.section.id,
        title: data.section.title,
        description: data.section.description,
        sort_order: data.section.sort_order,
        course_lessons: []
      }

      onSectionsChange([...sections, newSection])
      setNewSectionTitle('')
      setEditingSection(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Sektion')
    } finally {
      setLoading(false)
    }
  }

  const updateSection = async (sectionId: string, title: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren der Sektion')
      }

      // Sektion in der Liste aktualisieren
      const updatedSections = sections.map(section =>
        section.id === sectionId ? { ...section, title: data.section.title } : section
      )
      onSectionsChange(updatedSections)
      setEditingSection(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Sektion')
    } finally {
      setLoading(false)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Sind Sie sicher? Alle Lektionen in dieser Sektion werden ebenfalls gelöscht.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen der Sektion')
      }

      // Sektion aus der Liste entfernen
      const updatedSections = sections.filter(section => section.id !== sectionId)
      onSectionsChange(updatedSections)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Sektion')
    } finally {
      setLoading(false)
    }
  }

  const startEditingLesson = (sectionId: string, lesson?: Lesson) => {
    setEditingLesson({
      sectionId,
      lessonId: lesson?.id,
      title: lesson?.title || '',
      description: lesson?.description || '',
      video_url: lesson?.video_url || '',
      duration_minutes: lesson?.duration_minutes || 0,
      is_preview: lesson?.is_preview || false
    })
  }

  const saveLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim()) return

    setLoading(true)
    setError(null)

    try {
      const lessonData = {
        title: editingLesson.title.trim(),
        description: editingLesson.description.trim() || null,
        video_url: editingLesson.video_url || null,
        duration_minutes: editingLesson.duration_minutes,
        is_preview: editingLesson.is_preview,
        section_id: editingLesson.sectionId
      }

      let response
      if (editingLesson.lessonId) {
        // Lektion aktualisieren
        response = await fetch(`/api/admin/lessons/${editingLesson.lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData)
        })
      } else {
        // Neue Lektion erstellen
        const section = sections.find(s => s.id === editingLesson.sectionId)
        response = await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lessonData,
            sort_order: (section?.course_lessons.length || 0) + 1
          })
        })
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern der Lektion')
      }

      // Sektionen aktualisieren
      const updatedSections = sections.map(section => {
        if (section.id === editingLesson.sectionId) {
          if (editingLesson.lessonId) {
            // Bestehende Lektion aktualisieren
            return {
              ...section,
              course_lessons: section.course_lessons.map(lesson =>
                lesson.id === editingLesson.lessonId ? data.lesson : lesson
              )
            }
          } else {
            // Neue Lektion hinzufügen
            return {
              ...section,
              course_lessons: [...section.course_lessons, data.lesson]
            }
          }
        }
        return section
      })

      onSectionsChange(updatedSections)
      setEditingLesson(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Lektion')
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Lektion löschen möchten?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Fehler beim Löschen der Lektion')
      }

      // Lektion aus der Sektion entfernen
      const updatedSections = sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              course_lessons: section.course_lessons.filter(lesson => lesson.id !== lessonId)
            }
          : section
      )
      onSectionsChange(updatedSections)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen der Lektion')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoUpload = (videoUrl: string, fileName: string, fileSize: number) => {
    if (editingLesson) {
      setEditingLesson({
        ...editingLesson,
        video_url: videoUrl,
        // Schätze die Dauer basierend auf der Dateigröße (sehr grob)
        duration_minutes: editingLesson.duration_minutes || Math.max(1, Math.floor(fileSize / (1024 * 1024 * 10)))
      })
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sektionen */}
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection(section.id)}
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {editingSection === section.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Sektionsname"
                      className="w-64"
                    />
                    <Button
                      size="sm"
                      onClick={() => updateSection(section.id, newSectionTitle)}
                      disabled={loading || !newSectionTitle.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSection(null)
                        setNewSectionTitle('')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Badge variant="outline">
                      {section.course_lessons.length} Lektionen
                    </Badge>
                  </div>
                )}
              </div>
              
              {editingSection !== section.id && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSection(section.id)
                      setNewSectionTitle(section.title)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSection(section.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          {expandedSections.has(section.id) && (
            <CardContent className="space-y-4">
              {/* Lektionen */}
              {section.course_lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        {lesson.description && (
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.is_preview && (
                          <Badge variant="outline" className="text-xs">Preview</Badge>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {lesson.duration_minutes}min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingLesson(section.id, lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLesson(section.id, lesson.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Neue Lektion hinzufügen */}
              <Button
                variant="outline"
                onClick={() => startEditingLesson(section.id)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Lektion hinzufügen
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Neue Sektion hinzufügen */}
      <Card>
        <CardContent className="pt-6">
          {editingSection === 'new' ? (
            <div className="flex items-center space-x-2">
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Sektionsname eingeben..."
                className="flex-1"
              />
              <Button
                onClick={addSection}
                disabled={loading || !newSectionTitle.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingSection(null)
                  setNewSectionTitle('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setEditingSection('new')}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neue Sektion hinzufügen
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lektion bearbeiten Modal/Dialog */}
      {editingLesson && (
        <Card className="fixed inset-0 z-50 m-4 overflow-auto bg-white">
          <CardHeader>
            <CardTitle>
              {editingLesson.lessonId ? 'Lektion bearbeiten' : 'Neue Lektion'}
            </CardTitle>
            <CardDescription>
              Fügen Sie Videos und Details zu dieser Lektion hinzu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lektion Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lesson-title">Titel *</Label>
                  <Input
                    id="lesson-title"
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      title: e.target.value
                    })}
                    placeholder="z.B. Grundlegende Schlagtechniken"
                  />
                </div>

                <div>
                  <Label htmlFor="lesson-description">Beschreibung</Label>
                  <Textarea
                    id="lesson-description"
                    value={editingLesson.description}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      description: e.target.value
                    })}
                    placeholder="Beschreibung der Lektion..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="lesson-duration">Dauer (Minuten)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    min="1"
                    value={editingLesson.duration_minutes}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      duration_minutes: parseInt(e.target.value) || 0
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lesson-preview"
                    checked={editingLesson.is_preview}
                    onChange={(e) => setEditingLesson({
                      ...editingLesson,
                      is_preview: e.target.checked
                    })}
                  />
                  <Label htmlFor="lesson-preview">Als kostenlose Vorschau verfügbar</Label>
                </div>

                {editingLesson.video_url && (
                  <div>
                    <Label>Aktuelles Video</Label>
                    <video
                      src={editingLesson.video_url}
                      controls
                      className="w-full max-h-48 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <VideoUpload
                  onUploadComplete={handleVideoUpload}
                  onUploadError={(error) => setError(error)}
                />
              </div>
            </div>

            {/* Aktionen */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setEditingLesson(null)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={saveLesson}
                disabled={loading || !editingLesson.title.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingLesson.lessonId ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
