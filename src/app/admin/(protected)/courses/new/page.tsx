'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ArrowRight,
  Save, 
  Eye, 
  Plus, 
  X,
  Video,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  GripVertical,
  PlayCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '@/components/admin/file-upload'

interface CourseFormData {
  title: string
  shortDescription: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
  category: string
  thumbnail_url: string | null
  trailer_video_url: string | null
  whatYouLearn: string[]
  requirements: string[]
  targetAudience: string[]
  isPublished: boolean
  isFeatured: boolean
}

interface Section {
  id: string
  title: string
  description?: string
  sort_order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  sort_order: number
  is_preview: boolean
  video_duration_seconds: number
}

interface NewSectionData {
  title: string
  description: string
}

interface NewLessonData {
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  is_preview: boolean
  section_id: string
}

const levelOptions = [
  { value: 'beginner', label: 'Anfänger' },
  { value: 'intermediate', label: 'Fortgeschritten' },
  { value: 'advanced', label: 'Experte' },
  { value: 'all_levels', label: 'Alle Level' }
]

interface Category {
  id: string
  name: string
  description?: string
}

export default function NewCoursePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    shortDescription: '',
    description: '',
    level: 'beginner',
    category: '',
    thumbnail_url: null,
    trailer_video_url: null,
    whatYouLearn: [''],
    requirements: [''],
    targetAudience: [''],
    isPublished: false,
    isFeatured: false
  })
  
  // Lektionen-Daten
  const [sections, setSections] = useState<Section[]>([])
  const [newSectionDialog, setNewSectionDialog] = useState(false)
  const [newLessonDialog, setNewLessonDialog] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>('')
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
  
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Kategorien laden
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Fehler beim Laden der Kategorien')
        }
        
        setCategories(data.categories || [])
        if (data.categories && data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category: data.categories[0].id }))
        }
      } catch (err) {
        console.error('Fehler beim Laden der Kategorien:', err)
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Kategorien')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'whatYouLearn' | 'requirements' | 'targetAudience', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const addArrayItem = (field: 'whatYouLearn' | 'requirements' | 'targetAudience') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeArrayItem = (field: 'whatYouLearn' | 'requirements' | 'targetAudience', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const handleAddSection = () => {
    const newSection: Section = {
      id: `temp_${Date.now()}`,
      title: newSectionData.title,
      description: newSectionData.description,
      sort_order: sections.length + 1,
      lessons: []
    }
    
    setSections(prev => [...prev, newSection])
    setNewSectionDialog(false)
    setNewSectionData({ title: '', description: '' })
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: `temp_${Date.now()}`,
      title: newLessonData.title,
      description: newLessonData.description,
      video_url: newLessonData.video_url,
      thumbnail_url: newLessonData.thumbnail_url,
      is_preview: newLessonData.is_preview,
      sort_order: 1,
      video_duration_seconds: 0
    }

    setSections(prev => prev.map(section => {
      if (section.id === newLessonData.section_id) {
        return {
          ...section,
          lessons: [...section.lessons, { ...newLesson, sort_order: section.lessons.length + 1 }]
        }
      }
      return section
    }))

    setNewLessonDialog(false)
    setNewLessonData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      is_preview: false,
      section_id: ''
    })
  }

  const handleDeleteLesson = (sectionId: string, lessonId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.filter(l => l.id !== lessonId)
        }
      }
      return section
    }))
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTotalLessons = () => {
    return sections.reduce((total, section) => total + section.lessons.length, 0)
  }

  const getPreviewLessons = () => {
    return sections.reduce((total, section) => 
      total + section.lessons.filter(lesson => lesson.is_preview).length, 0)
  }

  const handleSubmit = async (publish = false) => {
    setSaving(true)
    setError(null)
    
    try {
      // Kurs-Daten vorbereiten
      const courseData = {
        title: formData.title,
        short_description: formData.shortDescription,
        description: formData.description,
        category_id: formData.category,
        level: formData.level,
        thumbnail_url: formData.thumbnail_url,
        trailer_video_url: formData.trailer_video_url,
        what_you_learn: formData.whatYouLearn.filter(item => item.trim() !== ''),
        requirements: formData.requirements.filter(item => item.trim() !== ''),
        target_audience: formData.targetAudience.filter(item => item.trim() !== ''),
        is_published: publish,
        is_featured: formData.isFeatured,
        sections: sections.map(section => ({
          title: section.title,
          description: section.description,
          sort_order: section.sort_order,
          lessons: section.lessons.map(lesson => ({
            title: lesson.title,
            description: lesson.description,
            video_url: lesson.video_url,
            thumbnail_url: lesson.thumbnail_url,
            sort_order: lesson.sort_order,
            is_preview: lesson.is_preview,
            video_duration_seconds: lesson.video_duration_seconds
          }))
        }))
      }

      console.log('Creating course with data:', courseData)
      
      const response = await fetch('/api/admin/courses/create-with-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern des Kurses')
      }

      // Erfolgreich erstellt
      router.push('/admin/courses')
      
    } catch (err) {
      console.error('Fehler beim Speichern des Kurses:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern des Kurses')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = () => {
    handleSubmit(false)
  }

  const handlePublish = () => {
    handleSubmit(true)
  }

  const canProceedToStep2 = () => {
    return formData.title.trim() && 
           formData.shortDescription.trim() && 
           formData.description.trim() && 
           formData.category
  }

  const canPublish = () => {
    return canProceedToStep2() && 
           sections.length > 0 && 
           sections.some(section => section.lessons.length > 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Neuer Kurs</h1>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-green-600' : 'text-gray-400'}`}>
          {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">1</div>}
          <span className="font-medium">Grundinformationen</span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className={`flex items-center space-x-2 ${currentStep === 2 ? 'text-blue-600' : currentStep > 2 ? 'text-green-600' : 'text-gray-400'}`}>
          {currentStep > 2 ? <CheckCircle className="h-5 w-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">2</div>}
          <span className="font-medium">Lektionen & Inhalte</span>
        </div>
      </div>

      {/* Step 1: Grundinformationen */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kurs-Details</CardTitle>
              <CardDescription>Grundlegende Informationen über Ihren Kurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Kurs-Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="z.B. Krav Maga für Anfänger"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Kurze Beschreibung *</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Eine prägnante Zusammenfassung des Kurses"
                />
              </div>

              <div>
                <Label htmlFor="description">Ausführliche Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detaillierte Beschreibung des Kursinhalts"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Kategorie *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Lade..." : "Kategorie auswählen"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medien</CardTitle>
              <CardDescription>Kurs-Thumbnail und Trailer-Video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                bucket="thumbnails"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                maxSize={5}
                label="Kurs-Thumbnail"
                description="Empfohlen: 1280x720px, JPG oder PNG"
                onUploadComplete={(url) => handleInputChange('thumbnail_url', url)}
                onUploadError={(error) => setError(error)}
                existingFile={formData.thumbnail_url || undefined}
              />

              <FileUpload
                bucket="videos"
                accept="video/*,.mp4,.mov,.avi,.mkv"
                maxSize={500}
                label="Trailer-Video (optional)"
                description="Kurzer Vorschau-Clip für den Kurs"
                onUploadComplete={(url) => handleInputChange('trailer_video_url', url)}
                onUploadError={(error) => setError(error)}
                existingFile={formData.trailer_video_url || undefined}
              />
            </CardContent>
          </Card>

          {/* Lernziele, Voraussetzungen, Zielgruppe */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['whatYouLearn', 'requirements', 'targetAudience'] as const).map((field) => (
              <Card key={field}>
                <CardHeader>
                  <CardTitle>
                    {field === 'whatYouLearn' ? 'Was Sie lernen werden' :
                     field === 'requirements' ? 'Voraussetzungen' : 'Zielgruppe'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData[field].map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={item}
                          onChange={(e) => handleArrayChange(field, index, e.target.value)}
                          placeholder={`${field === 'whatYouLearn' ? 'Lernziel' : 
                                       field === 'requirements' ? 'Voraussetzung' : 'Zielgruppe'} eingeben`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem(field, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addArrayItem(field)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Hinzufügen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2()}
            >
              Weiter zu Lektionen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Lektionen & Inhalte */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Kurs-Inhalte</span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{sections.length} Sektionen</span>
                  <span>{getTotalLessons()} Lektionen</span>
                  <span>{getPreviewLessons()} Vorschau</span>
                </div>
              </CardTitle>
              <CardDescription>
                Organisieren Sie Ihre Lektionen in Sektionen für eine bessere Struktur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={() => setNewSectionDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Sektion hinzufügen
              </Button>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Video className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Noch keine Inhalte</p>
                  <p className="text-sm mb-4">Fügen Sie Sektionen und Lektionen hinzu, um Ihren Kurs zu strukturieren.</p>
                </div>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div key={section.id} className="border rounded-lg p-4">
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

                    <div className="space-y-2 ml-8">
                      {section.lessons.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm">Noch keine Lektionen</p>
                        </div>
                      ) : (
                        section.lessons.map((lesson, lessonIndex) => (
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteLesson(section.id, lesson.id)}
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

          <div className="flex items-center justify-between">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving || !canProceedToStep2()}
              >
                {saving ? 'Speichere...' : 'Als Entwurf speichern'}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={saving || !canPublish()}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Veröffentliche...' : 'Kurs veröffentlichen'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
              disabled={!newSectionData.title.trim()}
            >
              Sektion erstellen
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
              <Label>Lektions-Video</Label>
              <FileUpload
                bucket="videos"
                accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                maxSize={2048} // 2GB in MB
                onUploadComplete={(url) => setNewLessonData(prev => ({ ...prev, video_url: url }))}
                className="mt-2"
                description="Hauptvideo der Lektion"
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
              disabled={!newLessonData.title.trim() || !newLessonData.video_url}
            >
              Lektion erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}