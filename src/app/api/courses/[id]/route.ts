import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const courseId = params.id

    // Kurs mit Sektionen und Lektionen laden (nur veröffentlichte)
    // Verwende Service Role für Admin-Zugriff, um RLS zu umgehen
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name),
        course_sections(
          id,
          title,
          description,
          sort_order,
          course_lessons(
            id,
            title,
            description,
            video_duration_seconds,
            sort_order,
            is_preview,
            video_url,
            thumbnail_url
          )
        )
      `)
      .eq('id', courseId)
      .eq('is_published', true)
      .single()

    if (courseError) {
      console.error('Fehler beim Laden des Kurses:', courseError)
      return NextResponse.json({ error: 'Kurs nicht gefunden' }, { status: 404 })
    }

    // Sortiere Sektionen und Lektionen
    if (course.course_sections) {
      course.course_sections.sort((a: any, b: any) => a.sort_order - b.sort_order)
      course.course_sections.forEach((section: any) => {
        if (section.course_lessons) {
          section.course_lessons.sort((a: any, b: any) => a.sort_order - b.sort_order)
        }
      })
    }

    return NextResponse.json({ course })

  } catch (error) {
    console.error('Server-Fehler beim Laden des Kurses:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}