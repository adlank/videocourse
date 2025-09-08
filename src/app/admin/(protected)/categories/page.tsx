'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  BookOpen
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  course_count?: number
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const supabase = createClient()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('course_categories')
        .select(`
          *,
          courses(count)
        `)
        .order('name')

      if (categoriesError) throw categoriesError

      const formattedCategories = categoriesData?.map(category => ({
        ...category,
        course_count: category.courses?.length || 0
      })) || []

      setCategories(formattedCategories)
    } catch (err: any) {
      console.error('Error loading categories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const replacements: { [key: string]: string } = {
          'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss'
        }
        return replacements[match] || match
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const slug = generateSlug(formData.name)
      const categoryData = {
        name: formData.name,
        slug,
        description: formData.description || null,
        color: formData.color,
        updated_at: new Date().toISOString()
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('course_categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
        setSuccess('Kategorie erfolgreich aktualisiert!')
      } else {
        // Create new category
        const { error } = await supabase
          .from('course_categories')
          .insert({
            ...categoryData,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        setSuccess('Kategorie erfolgreich erstellt!')
      }

      // Reset form
      setFormData({ name: '', description: '', color: '#3B82F6' })
      setEditingCategory(null)
      setShowForm(false)
      loadCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    })
    setShowForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('course_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      setSuccess('Kategorie erfolgreich gelöscht!')
      loadCategories()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3B82F6' })
    setEditingCategory(null)
    setShowForm(false)
    setError(null)
    setSuccess(null)
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const colorOptions = [
    { name: 'Blau', value: '#3B82F6' },
    { name: 'Grün', value: '#10B981' },
    { name: 'Lila', value: '#8B5CF6' },
    { name: 'Rot', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Grau', value: '#6B7280' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Kategorien</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
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
        <h1 className="text-3xl font-bold">Kategorien</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Kategorie
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Formular */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie erstellen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Grundlagen"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Farbe</Label>
                  <div className="flex gap-2 mt-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionale Beschreibung der Kategorie..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Aktualisieren' : 'Erstellen'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Suchleiste */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Kategorien durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Kategorien-Liste */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm ? 'Keine Kategorien gefunden' : 'Noch keine Kategorien erstellt'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Versuche einen anderen Suchbegriff.' 
              : 'Erstelle deine erste Kategorie, um Kurse zu organisieren.'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Erste Kategorie erstellen
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {category.course_count || 0}
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-xs text-gray-500">
                      Erstellt: {new Date(category.created_at).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(category)}
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Löschen"
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
      )}
    </div>
  )
}
