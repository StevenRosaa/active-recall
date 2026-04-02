'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRecallProfiles() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('recall_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error.message)
    return []
  }
  return data
}

export async function addRecallProfile(name: string, intervals: number[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('recall_profiles')
    .insert([{ user_id: user.id, name, intervals }])

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function deleteRecallProfile(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verifichiamo l'RBAC e RLS: supabase con token user elimina solo roba dell'utente
  const { error } = await supabase
    .from('recall_profiles')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
