'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Provider, createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Impossibile accedere con queste credenziali')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const birthDate = formData.get('birth_date') as string
  const username = formData.get('username') as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        username: username
      }
    }
  })

  if (authError || !authData.user) {
    redirect('/login?error=Impossibile registrare utente')
  }

  // Creazione automatica del record del profilo (via Service Role per bypassare RLS se l'INSERT autonomo fallisce a sessione non ancora attiva)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let profileError = null

  if (serviceRoleKey) {
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error } = await adminSupabase.from('profiles').insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      username: username,
      is_active: true
    })
    profileError = error
  } else {
    const { error } = await supabase.from('profiles').insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      username: username,
      is_active: true
    })
    profileError = error
  }

  if (profileError) {
    console.error("Profile creation error:", profileError)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// Nuova funzione per OAuth (Google / Apple)
export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient()

  // URL base per il reindirizzamento dopo il login (fallback su localhost per lo sviluppo)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}