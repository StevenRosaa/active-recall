'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAnalyticsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Fetch all activities
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  const completedActivities = activities.filter(a => a.is_completed)

  let totalMinutes = 0
  const heatmapData: Record<string, number> = {}

  completedActivities.forEach(act => {
    const dur = act.actual_duration || 0
    if (dur > 0) {
      totalMinutes += dur
      const dStr = act.date
      heatmapData[dStr] = (heatmapData[dStr] || 0) + dur
    }
  })

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const completedSessions = completedActivities.length

  // Streak Calculation
  let currentStreak = 0
  
  // Format local date safely to YYYY-MM-DD
  const getLocalDateStr = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - (offset * 60 * 1000))
    return local.toISOString().split('T')[0]
  }

  const todayStr = getLocalDateStr(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = getLocalDateStr(yesterdayDate)

  const hasStudiedOn = (dateStr: string) => Object.hasOwn(heatmapData, dateStr)

  let processDate = new Date()
  if (hasStudiedOn(todayStr)) {
    // Streak includes today
  } else if (hasStudiedOn(yesterdayStr)) {
    // Did not study today yet, but studied yesterday
    processDate = yesterdayDate
  } else {
    // Streak is broken
    processDate = null as any
  }

  if (processDate) {
    while (true) {
      const dStr = getLocalDateStr(processDate)
      if (hasStudiedOn(dStr)) {
        currentStreak++
        processDate.setDate(processDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  // Weekly Data (last 7 days, planned vs actual)
  const weeklyData = []

  const getTimeDiffMins = (start: string | null, end: string | null) => {
    if (!start || !end) return 0
    const [h1, m1] = start.split(':').map(Number)
    const [h2, m2] = end.split(':').map(Number)
    return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1))
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const str = getLocalDateStr(d)
    const dayName = d.toLocaleDateString('it-IT', { weekday: 'short' })
    
    // Ricava pianificato e effettivo per giorno specifico
    const dayActs = activities.filter(a => a.date === str)
    let planned = 0
    let actual = 0
    for (const a of dayActs) {
      planned += getTimeDiffMins(a.time_start, a.time_end)
      actual += a.actual_duration || 0
    }

    weeklyData.push({
      date: str,
      day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      planned,
      actual
    })
  }

  return {
    totalHours,
    completedSessions,
    currentStreak,
    heatmapData,
    weeklyData
  }
}
