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
    const {
      course_id,
      lesson_id,
      current_time_seconds,
      progress_percentage,
      total_watch_time,
      completed
    } = body

    // Validation
    if (!course_id || !lesson_id) {
      return NextResponse.json({ 
        error: 'Kurs-ID und Lektions-ID sind erforderlich' 
      }, { status: 400 })
    }

    // Prüfen ob Kurs und Lektion existieren
    const { data: lesson, error: lessonError } = await supabase
      .from('course_lessons')
      .select('id, course_id')
      .eq('id', lesson_id)
      .eq('course_id', course_id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lektion nicht gefunden' }, { status: 404 })
    }

    // Fortschritt speichern oder aktualisieren
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        course_id,
        lesson_id,
        current_time_seconds: current_time_seconds || 0,
        progress_percentage: Math.min(100, Math.max(0, progress_percentage || 0)),
        total_watch_time: total_watch_time || 0,
        completed: completed || false,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (progressError) {
      console.error('Fehler beim Speichern des Fortschritts:', progressError)
      return NextResponse.json({ error: 'Fortschritt konnte nicht gespeichert werden' }, { status: 500 })
    }

    // Kurs-Gesamtfortschritt aktualisieren
    const { data: allLessonsProgress } = await supabase
      .from('user_progress')
      .select('progress_percentage, completed')
      .eq('user_id', user.id)
      .eq('course_id', course_id)

    if (allLessonsProgress) {
      const totalLessons = allLessonsProgress.length
      const completedLessons = allLessonsProgress.filter(p => p.completed).length
      const avgProgress = allLessonsProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalLessons
      
      // Kurs-Fortschritt in separater Tabelle speichern (optional)
      await supabase
        .from('user_course_progress')
        .upsert({
          user_id: user.id,
          course_id,
          total_lessons: totalLessons,
          completed_lessons: completedLessons,
          overall_progress: Math.round(avgProgress),
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ progress }, { status: 200 })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Speichern des Fortschritts:', error)
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
    const courseId = searchParams.get('course_id')
    const lessonId = searchParams.get('lesson_id')

    let query = supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)

    if (courseId) {
      query = query.eq('course_id', courseId)
    }
    if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data: progress, error: progressError } = await query.order('last_accessed_at', { ascending: false })

    if (progressError) {
      console.error('Fehler beim Laden des Fortschritts:', progressError)
      return NextResponse.json({ error: 'Fortschritt konnte nicht geladen werden' }, { status: 500 })
    }

    return NextResponse.json({ progress })

  } catch (error) {
    console.error('Unerwarteter Fehler beim Laden des Fortschritts:', error)
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 })
  }
}