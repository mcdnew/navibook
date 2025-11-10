'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Get user role and redirect accordingly
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userRecord) {
      revalidatePath('/', 'layout')

      // Redirect based on role
      if (userRecord.role === 'admin' || userRecord.role === 'office_staff' || userRecord.role === 'manager') {
        redirect('/dashboard')
      } else if (userRecord.role === 'regular_agent' || userRecord.role === 'power_agent') {
        redirect('/quick-book')
      } else if (userRecord.role === 'captain') {
        redirect('/my-bookings')
      }
    }
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
      }
    }
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Create user record in users table
  if (authData.user) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single()

    if (companies) {
      await supabase.from('users').insert({
        id: authData.user.id,
        company_id: companies.id,
        role: 'regular_agent',
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: data.email,
        is_active: true,
      })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
