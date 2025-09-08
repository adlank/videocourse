import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const courseId = params.id

    // Kurs mit allen Details laden
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name),
        course_sections(
          *,
          course_lessons(*)
        )
      `)
      .eq('id', courseId)
      .single()

    if (courseError) {
      return NextResponse.json({ error: 'Kurs nicht gefunden', details: courseError }, { status: 404 })
    }

    // Zusätzliche Statistiken
    const totalSections = course.course_sections?.length || 0
    const totalLessons = course.course_sections?.reduce((sum: number, section: any) => 
      sum + (section.course_lessons?.length || 0), 0) || 0

    return NextResponse.json({ 
      course,
      stats: {
        totalSections,
        totalLessons,
        sectionsWithLessons: course.course_sections?.filter((s: any) => s.course_lessons?.length > 0).length || 0
      }
    })

  } catch (error) {
    console.error('Debug API Fehler:', error)
    return NextResponse.json({ error: 'Server-Fehler', details: error }, { status: 500 })
  }
}
