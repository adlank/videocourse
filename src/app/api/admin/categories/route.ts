import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Kategorien abrufen
    const { data: categories, error: categoriesError } = await supabase
      .from('course_categories')
      .select('*')
      .order('name', { ascending: true })

    if (categoriesError) {
      console.error('Fehler beim Laden der Kategorien:', categoriesError)
      return NextResponse.json({ error: 'Kategorien konnten nicht geladen werden' }, { status: 500 })
    }

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Unerwarteter Fehler:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}

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
    const { name, description } = body

    // Validation
    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 })
    }

    // Kategorie erstellen
    const { data: category, error: categoryError } = await supabase
      .from('course_categories')
      .insert({
        name,
        description: description || null
      })
      .select()
      .single()

    if (categoryError) {
      console.error('Fehler beim Erstellen der Kategorie:', categoryError)
      return NextResponse.json({ error: 'Kategorie konnte nicht erstellt werden' }, { status: 500 })
    }

    return NextResponse.json({ category }, { status: 201 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Erstellen der Kategorie:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}
