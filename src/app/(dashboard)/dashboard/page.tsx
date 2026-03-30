import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarDashboard from './calendar-dashboard'
import { Activity } from '@/types/index'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  return (
    <CalendarDashboard initialActivities={(activities as Activity[]) || []} />
  )
}
