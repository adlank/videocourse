import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
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

    // Kurs mit Sektionen und Lektionen laden
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_sections (
          *,
          course_lessons (
            *
          )
        )
      `)
      .eq('id', courseId)
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

    const courseId = params.id
    const body = await request.json()

    // Kurs aktualisieren
    const { data: updatedCourse, error: updateError } = await supabase
      .from('courses')
      .update({
        title: body.title,
        short_description: body.short_description,
        description: body.description,
        level: body.level,
        category_id: body.category_id,
        thumbnail_url: body.thumbnail_url,
        trailer_video_url: body.trailer_video_url,
        what_you_learn: body.what_you_learn,
        requirements: body.requirements,
        target_audience: body.target_audience,
        is_published: body.is_published,
        is_featured: body.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .select()
      .single()

    if (updateError) {
      console.error('Fehler beim Aktualisieren des Kurses:', updateError)
      return NextResponse.json({ error: 'Fehler beim Aktualisieren des Kurses' }, { status: 500 })
    }

    return NextResponse.json({ course: updatedCourse })

  } catch (error) {
    console.error('Server-Fehler beim Aktualisieren des Kurses:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}

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

    const courseId = params.id

    // Kurs löschen (CASCADE löscht automatisch Sektionen und Lektionen)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (deleteError) {
      console.error('Fehler beim Löschen des Kurses:', deleteError)
      return NextResponse.json({ error: 'Fehler beim Löschen des Kurses' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Server-Fehler beim Löschen des Kurses:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}