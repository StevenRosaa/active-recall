'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addActivity(payloadJson: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const activitiesToInsert = JSON.parse(payloadJson)

  // Ensure security overrides by assigning correct user.id
  const secureActivities = activitiesToInsert.map((act: any) => ({
    ...act,
    user_id: user.id
  }))

  const { error } = await supabase.from('activities').insert(secureActivities)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function editActivity(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const dateFrom = formData.get('dateFrom') as string
  const time_start = formData.get('time_start') as string || null
  const time_end = formData.get('time_end') as string || null
  const subject = formData.get('subject') as string
  const is_repetition = formData.get('is_repetition') === 'on'
  const is_exercise = formData.get('is_exercise') === 'on'
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('activities').update({
    date: dateFrom,
    time_start,
    time_end,
    subject,
    is_repetition,
    is_exercise,
    notes: notes || null
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function deleteActivity(idOrIds: string | string[], isSeries: boolean = false) {
  const supabase = await createClient()
  
  if (isSeries && typeof idOrIds === 'string') {
    const { error } = await supabase.from('activities').delete().eq('series_id', idOrIds)
    if (error) throw new Error(error.message)
  } else {
    const idsArray = Array.isArray(idOrIds) ? idOrIds : [idOrIds]
    const { error } = await supabase.from('activities').delete().in('id', idsArray)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function toggleActivityCompletion(id: string, is_completed: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('activities').update({ is_completed }).eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function updateActivityNotes(id: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('activities').update({ notes }).eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function saveSessionDuration(id: string, durationInMinutes: number) {
  const supabase = await createClient()
  
  // Aggiorna la durata e marca anche l'attività come completata automaticamente
  const { error } = await supabase.from('activities').update({ 
    actual_duration: durationInMinutes, 
    is_completed: true 
  }).eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

