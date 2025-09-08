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

    // Kurse mit Kategorien und Statistiken abrufen
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('Fehler beim Laden der Kurse:', coursesError)
      return NextResponse.json({ error: 'Kurse konnten nicht geladen werden' }, { status: 500 })
    }

    // Zusätzliche Statistiken für jeden Kurs
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Anzahl Lektionen
        const { count: lessonsCount } = await supabase
          .from('course_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)

        // Anzahl eingeschriebene Studenten
        const { count: studentsCount } = await supabase
          .from('user_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Durchschnittlicher Fortschritt (vereinfacht)
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('progress_percentage')
          .eq('course_id', course.id)

        const avgProgress = progressData && progressData.length > 0
          ? progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progressData.length
          : 0

        return {
          ...course,
          lessons_count: lessonsCount || 0,
          students_count: studentsCount || 0,
          average_progress: Math.round(avgProgress)
        }
      })
    )

    return NextResponse.json({ courses: coursesWithStats })

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
    
    const {
      title,
      short_description,
      description,
      category_id,
      level,
      what_you_learn,
      requirements,
      target_audience,
      is_published,
      is_featured,
      thumbnail_url,
      trailer_video_url
    } = body

    // Validation
    if (!title || !short_description || !category_id || !level) {
      return NextResponse.json({ 
        error: 'Titel, kurze Beschreibung, Kategorie und Level sind erforderlich' 
      }, { status: 400 })
    }

    // Kurs erstellen
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title,
        short_description,
        description: description || null,
        category_id,
        instructor_name: profile.full_name || 'Krav Maga Expert',
        level,
        what_you_learn: what_you_learn || [],
        requirements: requirements || [],
        target_audience: target_audience || [],
        is_published: is_published || false,
        is_featured: is_featured || false,
        thumbnail_url: thumbnail_url || null,
        trailer_video_url: trailer_video_url || null,
        duration_minutes: 0, // Wird später berechnet basierend auf Lektionen
        sort_order: 999 // Wird später angepasst
      })
      .select()
      .single()

    if (courseError) {
      console.error('Fehler beim Erstellen des Kurses:', courseError)
      return NextResponse.json({ error: 'Kurs konnte nicht erstellt werden' }, { status: 500 })
    }

    return NextResponse.json({ course }, { status: 201 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Erstellen des Kurses:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}
