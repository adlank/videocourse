import { createClient } from '@/lib/supabase/server'

export async function createAdminUser(email: string, password: string, fullName: string) {
  const supabase = createClient()
  
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed')
    }

    // Create profile with admin privileges
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't throw here as the auth user was created successfully
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
    console.error('Admin user creation error:', error)
    throw error
  }
}

export async function makeUserAdmin(userId: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Make user admin error:', error)
    throw error
  }
}

// Development helper to create default admin
export async function createDefaultAdmin() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('This function is only available in development mode')
  }

  const defaultAdminEmail = 'admin@kravmaga.com'
  const defaultAdminPassword = 'admin123'
  const defaultAdminName = 'Krav Maga Administrator'

  try {
    return await createAdminUser(defaultAdminEmail, defaultAdminPassword, defaultAdminName)
  } catch (error) {
    console.error('Default admin creation error:', error)
    throw error
  }
}
