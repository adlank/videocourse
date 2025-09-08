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

    // Request Body parsen
    const body = await request.json()
    const { lesson_id, time_seconds, title } = body

    // Validation
    if (!lesson_id || time_seconds === undefined) {
      return NextResponse.json({ 
        error: 'Lektions-ID und Zeitpunkt sind erforderlich' 
      }, { status: 400 })
    }

    // Prüfen ob Lektion existiert
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .select('id, title')
      .eq('id', lesson_id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lektion nicht gefunden' }, { status: 404 })
    }

    // Standard-Titel generieren falls nicht angegeben
    const bookmarkTitle = title || `${Math.floor(time_seconds / 60)}:${String(Math.floor(time_seconds % 60)).padStart(2, '0')}`

    // Bookmark erstellen
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('lesson_bookmarks')
      .insert({
        user_id: user.id,
        lesson_id,
        time_seconds: Math.max(0, time_seconds),
        title: bookmarkTitle,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookmarkError) {
      console.error('Fehler beim Erstellen des Bookmarks:', bookmarkError)
      return NextResponse.json({ error: 'Bookmark konnte nicht erstellt werden' }, { status: 500 })
    }

    return NextResponse.json({ bookmark }, { status: 201 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Erstellen des Bookmarks:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = createClient()

  try {
    // Authentifizierung prüfen
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lesson_id')

    let query = supabase
      .from('lesson_bookmarks')
      .select('*')
      .eq('user_id', user.id)

    if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data: bookmarks, error: bookmarksError } = await query.order('time_seconds', { ascending: true })

    if (bookmarksError) {
      console.error('Fehler beim Laden der Bookmarks:', bookmarksError)
      return NextResponse.json({ error: 'Bookmarks konnten nicht geladen werden' }, { status: 500 })
    }

    return NextResponse.json({ bookmarks })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Laden der Bookmarks:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient()

  try {
    // Authentifizierung prüfen
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('id')

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark-ID ist erforderlich' }, { status: 400 })
    }

    // Prüfen ob Bookmark dem User gehört
    const { data: existingBookmark, error: checkError } = await supabase
      .from('lesson_bookmarks')
      .select('id')
      .eq('id', bookmarkId)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingBookmark) {
      return NextResponse.json({ error: 'Bookmark nicht gefunden' }, { status: 404 })
    }

    // Bookmark löschen
    const { error: deleteError } = await supabase
      .from('lesson_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Fehler beim Löschen des Bookmarks:', deleteError)
      return NextResponse.json({ error: 'Bookmark konnte nicht gelöscht werden' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bookmark erfolgreich gelöscht' })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Löschen des Bookmarks:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}
