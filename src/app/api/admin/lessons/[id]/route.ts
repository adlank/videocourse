import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
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

    const lessonId = params.id

    // Lektion löschen
    const { error: deleteError } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteError) {
      console.error('Fehler beim Löschen der Lektion:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen der Lektion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Server-Fehler beim Löschen der Lektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}

export async function PUT(
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

    const lessonId = params.id
    const body = await request.json()

    // Validierung
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 })
    }

    // Lektion aktualisieren
    const { data: updatedLesson, error: updateError } = await supabase
      .from('course_lessons')
      .update({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        video_url: body.video_url?.trim() || null,
        video_duration_seconds: body.video_duration_seconds || 0,
        thumbnail_url: body.thumbnail_url?.trim() || null,
        sort_order: body.sort_order,
        is_preview: body.is_preview || false,
        has_quiz: body.has_quiz || false,
        resources: body.resources || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single()

    if (updateError) {
      console.error('Fehler beim Aktualisieren der Lektion:', updateError)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren der Lektion' }, { status: 500 })
    }

    return NextResponse.json({ lesson: updatedLesson })

  } catch (error) {
    console.error('Server-Fehler beim Aktualisieren der Lektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}