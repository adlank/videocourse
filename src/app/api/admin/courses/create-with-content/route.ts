import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Validierung
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 })
    }

    if (!body.short_description?.trim()) {
      return NextResponse.json({ error: 'Kurze Beschreibung ist erforderlich' }, { status: 400 })
    }

    if (!body.description?.trim()) {
      return NextResponse.json({ error: 'Beschreibung ist erforderlich' }, { status: 400 })
    }

    if (!body.category_id) {
      return NextResponse.json({ error: 'Kategorie ist erforderlich' }, { status: 400 })
    }

    // Transaktion starten
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: body.title.trim(),
        short_description: body.short_description.trim(),
        description: body.description.trim(),
        level: body.level || 'beginner',
        category_id: body.category_id,
        thumbnail_url: body.thumbnail_url || null,
        trailer_video_url: body.trailer_video_url || null,
        what_you_learn: body.what_you_learn || [],
        requirements: body.requirements || [],
        target_audience: body.target_audience || [],
        is_published: body.is_published || false,
        is_featured: body.is_featured || false,
        instructor_name: 'Krav Maga Expert'
      })
      .select()
      .single()

    if (courseError) {
      console.error('Fehler beim Erstellen des Kurses:', courseError)
      return NextResponse.json({ error: 'Fehler beim Erstellen des Kurses' }, { status: 500 })
    }

    console.log('Kurs erstellt:', course.id)
    console.log('Sections to create:', body.sections)

    // Sektionen und Lektionen erstellen
    if (body.sections && body.sections.length > 0) {
      for (const sectionData of body.sections) {
        // Sektion erstellen
        const { data: section, error: sectionError } = await supabase
          .from('course_sections')
          .insert({
            course_id: course.id,
            title: sectionData.title,
            description: sectionData.description || null,
            sort_order: sectionData.sort_order
          })
          .select()
          .single()

        if (sectionError) {
          console.error('Fehler beim Erstellen der Sektion:', sectionError)
          // Kurs löschen bei Fehler
          await supabase.from('courses').delete().eq('id', course.id)
          return NextResponse.json({ error: 'Fehler beim Erstellen der Sektionen' }, { status: 500 })
        }

        console.log('Sektion erstellt:', section.id)
        console.log('Lessons to create for section:', sectionData.lessons)

        // Lektionen für diese Sektion erstellen
        if (sectionData.lessons && sectionData.lessons.length > 0) {
          for (const lessonData of sectionData.lessons) {
            const { error: lessonError } = await supabase
              .from('course_lessons')
              .insert({
                course_id: course.id,
                section_id: section.id,
                title: lessonData.title,
                description: lessonData.description || null,
                video_url: lessonData.video_url,
                thumbnail_url: lessonData.thumbnail_url || null,
                sort_order: lessonData.sort_order,
                is_preview: lessonData.is_preview || false,
                video_duration_seconds: lessonData.video_duration_seconds || 0
              })

            if (lessonError) {
              console.error('Fehler beim Erstellen der Lektion:', lessonError)
              console.error('Lesson data was:', lessonData)
              // Kurs löschen bei Fehler
              await supabase.from('courses').delete().eq('id', course.id)
              return NextResponse.json({ error: 'Fehler beim Erstellen der Lektionen' }, { status: 500 })
            } else {
              console.log('Lektion erstellt für Sektion:', section.id, 'Titel:', lessonData.title)
            }
          }
        }
      }
    }

    // Kurs-Dauer berechnen und aktualisieren
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('video_duration_seconds')
      .eq('course_id', course.id)

    const totalDuration = lessons?.reduce((sum, lesson) => sum + (lesson.video_duration_seconds || 0), 0) || 0

    await supabase
      .from('courses')
      .update({ 
        duration_minutes: Math.ceil(totalDuration / 60),
        updated_at: new Date().toISOString()
      })
      .eq('id', course.id)

    return NextResponse.json({ 
      course: { ...course, duration_minutes: Math.ceil(totalDuration / 60) },
      message: 'Kurs erfolgreich erstellt'
    })

  } catch (error) {
    console.error('Server-Fehler beim Erstellen des Kurses:', error)
    return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 })
  }
}
