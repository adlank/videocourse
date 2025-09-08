import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Benutzer-Authentifizierung prüfen
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Admin-Berechtigung prüfen
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    const courseId = params.id
    const body = await request.json()

    // Validierung
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 })
    }
    
    if (!body.video_url?.trim()) {
      return NextResponse.json({ error: 'Video-URL ist erforderlich' }, { status: 400 })
    }
    
    if (!body.section_id?.trim()) {
      return NextResponse.json({ error: 'Sektion ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob Kurs und Sektion existieren
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Kurs nicht gefunden' }, { status: 404 })
    }

    const { data: section, error: sectionError } = await supabase
      .from('course_sections')
      .select('id')
      .eq('id', body.section_id)
      .eq('course_id', courseId)
      .single()

    if (sectionError || !section) {
      return NextResponse.json({ error: 'Sektion nicht gefunden' }, { status: 404 })
    }

    // Video-Dauer aus Metadaten extrahieren (vereinfacht)
    // In einer echten Anwendung würde man die Video-Datei analysieren
    const videoDurationSeconds = body.video_duration_seconds || 0

    // Neue Lektion erstellen
    const { data: newLesson, error: lessonError } = await supabase
      .from('course_lessons')
      .insert({
        course_id: courseId,
        section_id: body.section_id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        video_url: body.video_url.trim(),
        video_duration_seconds: videoDurationSeconds,
        thumbnail_url: body.thumbnail_url?.trim() || null,
        sort_order: body.sort_order || 1,
        is_preview: body.is_preview || false,
        has_quiz: body.has_quiz || false,
        resources: body.resources || []
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Fehler beim Erstellen der Lektion:', lessonError)
      return NextResponse.json({ error: 'Fehler beim Erstellen der Lektion' }, { status: 500 })
    }

    return NextResponse.json({ lesson: newLesson })

  } catch (error) {
    console.error('Server-Fehler beim Erstellen der Lektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}
