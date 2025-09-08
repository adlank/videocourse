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

    // Prüfen ob Kurs existiert
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Kurs nicht gefunden' }, { status: 404 })
    }

    // Neue Sektion erstellen
    const { data: newSection, error: sectionError } = await supabase
      .from('course_sections')
      .insert({
        course_id: courseId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        sort_order: body.sort_order || 1
      })
      .select()
      .single()

    if (sectionError) {
      console.error('Fehler beim Erstellen der Sektion:', sectionError)
      return NextResponse.json({ error: 'Fehler beim Erstellen der Sektion' }, { status: 500 })
    }

    return NextResponse.json({ section: newSection })

  } catch (error) {
    console.error('Server-Fehler beim Erstellen der Sektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}
