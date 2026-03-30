'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function updateProfile(data: { first_name: string; last_name: string; birth_date: string; username: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non autenticato" }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
  if (error) return { error: error.message }
  
  // Update auth metadata per riflettere subito i cambiamenti
  await supabase.auth.updateUser({
    data: {
      full_name: `${data.first_name} ${data.last_name}`,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      birth_date: data.birth_date
    }
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateEmail(newEmail: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { error } = await supabase.auth.updateUser({ 
    password: newPassword,
    data: { password_updated_at: now }
  })
  if (error) return { error: error.message }
  
  // Note: changing password automatically invalidates other sessions in Supabase Auth.
  return { success: true }
}

export async function deactivateAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non autenticato" }

  const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', user.id)
  if (error) return { error: error.message }

  await supabase.auth.signOut()
  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Utente non autenticato" }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { error: "SUPABASE_SERVICE_ROLE_KEY non configurata sul server" }

  const adminAuthClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Explicit hard delete from auth.users (cascades to profiles table via FK constraints)
  const { error } = await adminAuthClient.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }
  
  await supabase.auth.signOut()
  return { success: true }
}
