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
    const { course_id, title, description, sort_order } = body

    // Validation
    if (!course_id || !title) {
      return NextResponse.json({ 
        error: 'Kurs-ID und Titel sind erforderlich' 
      }, { status: 400 })
    }

    // Prüfen ob Kurs existiert
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Kurs nicht gefunden' }, { status: 404 })
    }

    // Sektion erstellen
    const { data: section, error: sectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id,
        title: title.trim(),
        description: description?.trim() || null,
        sort_order: sort_order || 999
      })
      .select()
      .single()

    if (sectionError) {
      console.error('Fehler beim Erstellen der Sektion:', sectionError)
      return NextResponse.json({ error: 'Sektion konnte nicht erstellt werden' }, { status: 500 })
    }

    return NextResponse.json({ section }, { status: 201 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Erstellen der Sektion:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}
