import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    // Authentifizierung prüfen
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Admin-Berechtigung prüfen
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Keine Admin-Berechtigung' }, { status: 403 })
    }

    // Request Body parsen
    const body = await request.json()
    const { 
      section_id, 
      title, 
      description, 
      video_url, 
      duration_minutes, 
      is_preview, 
      sort_order 
    } = body

    // Validation
    if (!section_id || !title) {
      return NextResponse.json({ 
        error: 'Sektions-ID und Titel sind erforderlich' 
      }, { status: 400 })
    }

    // Prüfen ob Sektion existiert
    const { data: section, error: sectionError } = await supabase
      .from('course_sections')
      .select('id, course_id')
      .eq('id', section_id)
      .single()

    if (sectionError || !section) {
      return NextResponse.json({ error: 'Sektion nicht gefunden' }, { status: 404 })
    }

    // Lektion erstellen
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .insert({
        section_id,
        course_id: section.course_id,
        title: title.trim(),
        description: description?.trim() || null,
        video_url: video_url || null,
        duration_minutes: duration_minutes || 0,
        is_preview: is_preview || false,
        sort_order: sort_order || 999
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Fehler beim Erstellen der Lektion:', lessonError)
      return NextResponse.json({ error: 'Lektion konnte nicht erstellt werden' }, { status: 500 })
    }

    // Kurs-Gesamtdauer aktualisieren
    const { data: allLessons } = await supabase
      .from('course_lessons')
      .select('duration_minutes')
      .eq('course_id', section.course_id)

    if (allLessons) {
      const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
      
      await supabase
        .from('courses')
        .update({ 
          duration_minutes: totalDuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', section.course_id)
    }

    return NextResponse.json({ lesson }, { status: 201 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Erstellen der Lektion:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}
