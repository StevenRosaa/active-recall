'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addActivity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const dateFrom = formData.get('dateFrom') as string
  const time_start = formData.get('time_start') as string || null
  const time_end = formData.get('time_end') as string || null
  const subject = formData.get('subject') as string
  const is_repetition = formData.get('is_repetition') === 'on'
  const is_exercise = formData.get('is_exercise') === 'on'
  const notes = formData.get('notes') as string
  const recurrence = formData.get('recurrence') as string || 'nessuna'
  const repetitionsStr = formData.get('repetitions') as string
  const repetitions = repetitionsStr ? parseInt(repetitionsStr, 10) : 1

  const baseDate = new Date(dateFrom)
  const activitiesToInsert = []

  const series_id = recurrence !== 'nessuna' && repetitions > 1 ? crypto.randomUUID() : null

  const createRecord = (targetDate: Date) => ({
    user_id: user.id,
    date: targetDate.toISOString().split('T')[0],
    time_start,
    time_end,
    subject,
    is_repetition,
    is_exercise,
    notes: notes || null,
    series_id
  })

  // Generiamo le attività in base alla ricorsività
  if (recurrence === 'nessuna' || repetitions <= 1) {
    activitiesToInsert.push(createRecord(baseDate))
  } else {
    let current = new Date(baseDate)

    for (let i = 0; i < repetitions; i++) {
      activitiesToInsert.push(createRecord(new Date(current)))
      
      if (recurrence === 'giornaliera') {
        current.setDate(current.getDate() + 1)
      } else if (recurrence === 'settimanale') {
        current.setDate(current.getDate() + 7)
      } else if (recurrence === 'mensile') {
        current.setMonth(current.getMonth() + 1)
      } else if (recurrence === 'annuale') {
        current.setFullYear(current.getFullYear() + 1)
      } else {
        break // Fallback
      }
    }
  }

  const { error } = await supabase.from('activities').insert(activitiesToInsert)

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
