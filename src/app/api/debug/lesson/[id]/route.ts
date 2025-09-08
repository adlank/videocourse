import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const lessonId = params.id

    // Lesson mit allen Feldern laden
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (lessonError) {
      return NextResponse.json({ 
        error: 'Lesson not found', 
        details: lessonError 
      }, { status: 404 })
    }

    // Kurs-Information auch laden
    const { data: section, error: sectionError } = await supabase
      .from('course_sections')
      .select(`
        id,
        title,
        course_id,
        courses (
          id,
          title,
          is_published
        )
      `)
      .eq('id', lesson.section_id)
      .single()

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.video_url,
        thumbnail_url: lesson.thumbnail_url,
        video_duration_seconds: lesson.video_duration_seconds,
        sort_order: lesson.sort_order,
        is_preview: lesson.is_preview,
        section_id: lesson.section_id,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at
      },
      section: section || null,
      course: section?.courses || null,
      debug: {
        hasVideoUrl: !!lesson.video_url,
        hasThumbnailUrl: !!lesson.thumbnail_url,
        videoUrlLength: lesson.video_url?.length || 0,
        thumbnailUrlLength: lesson.thumbnail_url?.length || 0,
        allFields: Object.keys(lesson)
      }
    })

  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}
