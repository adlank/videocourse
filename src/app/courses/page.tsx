'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CourseCard } from '@/components/course/course-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

function CoursesContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Get initial filters from URL
    const category = searchParams.get('category') || ''
    const level = searchParams.get('level') || ''
    const search = searchParams.get('search') || ''

    setSelectedCategory(category)
    setSelectedLevel(level)
    setSearchTerm(search)
  }, [searchParams])

  useEffect(() => {
    const loadCoursesAndCategories = async () => {
      try {
        // Load categories
        const { data: categoriesData } = await supabase
          .from('course_categories')
          .select('*')
          .order('name')

        setCategories(categoriesData || [])

        // Build query for courses
        let query = supabase
          .from('courses')
          .select(`
            *,
            course_categories(name),
            course_lessons(id)
          `)
          .eq('is_published', true)

        // Apply filters
        if (selectedCategory) {
          const category = categoriesData?.find(cat => cat.slug === selectedCategory)
          if (category) {
            query = query.eq('category_id', category.id)
          }
        }

        if (selectedLevel) {
          query = query.eq('level', selectedLevel)
        }

        const { data: coursesData } = await query.order('created_at', { ascending: false })

        // Filter by search term on client side
        let filteredCourses = coursesData || []
        if (searchTerm) {
          filteredCourses = filteredCourses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }

        setCourses(filteredCourses)
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCoursesAndCategories()
  }, [supabase, selectedCategory, selectedLevel, searchTerm])

  const levelLabels = {
    beginner: 'Anfänger',
    intermediate: 'Fortgeschritten',
    advanced: 'Experte'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Lade Kurse...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Alle Kurse</h1>
          <p className="text-gray-600 mb-6">
            Entdecke unsere umfangreiche Bibliothek professioneller Video-Kurse
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Kurse durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Alle Kategorien
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedLevel === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedLevel('')}
              >
                Alle Level
              </Button>
              {Object.entries(levelLabels).map(([level, label]) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || selectedLevel || searchTerm) && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-gray-600">Aktive Filter:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Suche: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(cat => cat.slug === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedLevel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {levelLabels[selectedLevel as keyof typeof levelLabels]}
                  <button
                    onClick={() => setSelectedLevel('')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.084 2.291" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Keine Kurse gefunden</h3>
            <p className="text-gray-500">
              Versuche deine Suchkriterien zu ändern oder entferne einige Filter.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {courses.length} Kurs{courses.length !== 1 ? 'e' : ''} gefunden
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={{
                    ...course,
                    category: course.course_categories
                  }} 
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Kurse werden geladen...</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CoursesContent />
    </Suspense>
  )
}