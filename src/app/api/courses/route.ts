import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const limit = searchParams.get('limit')

    const supabase = createClient()

    let query = supabase
      .from('courses')
      .select(`
        *,
        course_categories(name, slug),
        course_lessons(id, title, duration_seconds, order_index)
      `)
      .eq('is_published', true)

    if (category) {
      query = query.eq('course_categories.slug', category)
    }

    if (level) {
      query = query.eq('level', level)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ courses })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category_id, level, thumbnail_url } = body

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category_id,
        instructor_id: user.id,
        level,
        thumbnail_url,
        duration_minutes: 0, // Will be calculated when lessons are added
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}