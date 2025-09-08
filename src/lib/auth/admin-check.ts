import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkAdminAccess() {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      redirect('/admin/login')
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, full_name, email')
      .eq('id', user.id)
      .single()

    console.log('Admin check for user:', user.email, 'Profile:', profile, 'Error:', profileError)

    if (profileError || !profile) {
      console.error('Profile error:', profileError)
      console.error('User ID:', user.id, 'Email:', user.email)
      
      // Try to create profile if it doesn't exist
      if (profileError?.code === 'PGRST116') { // No rows returned
        console.log('Creating missing profile for user:', user.email)
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
            is_admin: user.email === 'adlan.khatsuev@outlook.com', // Make your email admin
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          redirect('/admin/login')
        }
        
        if (!newProfile?.is_admin) {
          console.error('User is not admin after profile creation')
          redirect('/admin/login')
        }
        
        return { user, profile: newProfile }
      }
      
      redirect('/admin/login')
    }

    if (!profile.is_admin) {
      console.error('User is not admin:', profile)
      console.error('Profile is_admin value:', profile.is_admin, typeof profile.is_admin)
      redirect('/admin/login')
    }

    return {
      user,
      profile
    }
  } catch (error) {
    console.error('Admin check error:', error)
    redirect('/admin/login')
  }
}

export async function getAdminProfile() {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, full_name, email, avatar_url')
      .eq('id', user.id)
      .single()

    return profile?.is_admin ? { user, profile } : null
  } catch (error) {
    console.error('Get admin profile error:', error)
    return null
  }
}
