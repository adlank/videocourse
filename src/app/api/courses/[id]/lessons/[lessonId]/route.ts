import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasFullAccess } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } }
) {
  try {
    const supabase = createClient()
    
    const courseId = params.id
    const lessonId = params.lessonId

    // Kurs mit Sektionen und Lektionen laden (mit Service Role um RLS zu umgehen)
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        level,
        instructor_name,
        course_sections (
          id,
          title,
          description,
          sort_order,
          course_lessons (
            id,
            title,
            description,
            video_url,
            video_duration_seconds,
            thumbnail_url,
            sort_order,
            is_preview,
            has_quiz,
            resources
          )
        )
      `)
      .eq('id', courseId)
      .eq('is_published', true)
      .single()

    if (courseError || !courseData) {
      return NextResponse.json({ error: 'Kurs nicht gefunden' }, { status: 404 })
    }

    // Flatten alle Lektionen und sortieren
    const allCourseLessons: any[] = []
    courseData.course_sections
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .forEach((section: any) => {
        const sectionLessons = section.course_lessons
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
        allCourseLessons.push(...sectionLessons)
      })

    // Aktuelle Lektion finden
    const lesson = allCourseLessons.find((l: any) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: 'Lektion nicht gefunden' }, { status: 404 })
    }

    const lessonIndex = allCourseLessons.findIndex((l: any) => l.id === lessonId)

    return NextResponse.json({ 
      course: courseData,
      lesson,
      allLessons: allCourseLessons,
      lessonIndex,
      hasAccess: hasFullAccess() // Konfigurierbar: Test-Modus oder Vollzugang
    })

  } catch (error) {
    console.error('Server-Fehler beim Laden der Lektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}
