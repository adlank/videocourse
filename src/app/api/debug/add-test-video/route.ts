import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
    }

    // Test-Video-URLs (öffentlich verfügbare Test-Videos)
    const testVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    const testThumbnailUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'

    // Lektion mit Test-Video aktualisieren
    const { data: updatedLesson, error: updateError } = await supabase
      .from('course_lessons')
      .update({
        video_url: testVideoUrl,
        thumbnail_url: testThumbnailUrl,
        video_duration_seconds: 596, // Big Buck Bunny duration
        updated_at: new Date().toISOString()
      })
      .eq('id', lessonId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update lesson', 
        details: updateError 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test-Video hinzugefügt',
      lesson: updatedLesson,
      testVideoUrl,
      testThumbnailUrl
    })

  } catch (error) {
    console.error('Add test video error:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error 
    }, { status: 500 })
  }
}
