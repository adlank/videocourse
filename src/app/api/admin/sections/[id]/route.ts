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

    const sectionId = params.id

    // Sektion löschen (CASCADE löscht automatisch alle Lektionen)
    const { error: deleteError } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', sectionId)

    if (deleteError) {
      console.error('Fehler beim Löschen der Sektion:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen der Sektion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Server-Fehler beim Löschen der Sektion:', error)
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

    const sectionId = params.id
    const body = await request.json()

    // Validierung
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 })
    }

    // Sektion aktualisieren
    const { data: updatedSection, error: updateError } = await supabase
      .from('course_sections')
      .update({
        title: body.title.trim(),
        description: body.description?.trim() || null,
        sort_order: body.sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)
      .select()
      .single()

    if (updateError) {
      console.error('Fehler beim Aktualisieren der Sektion:', updateError)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren der Sektion' }, { status: 500 })
    }

    return NextResponse.json({ section: updatedSection })

  } catch (error) {
    console.error('Server-Fehler beim Aktualisieren der Sektion:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}