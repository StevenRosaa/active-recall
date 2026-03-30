import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Protect this route with a secret key
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Here we use the Service Role Key to bypass RLS and fetch all users' data
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  // Fetch activities scheduled for today that are marked as repetitions
  const { data: activities, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('date', today)
    .eq('is_repetition', true)

  if (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const usersToRemind = new Map<string, any[]>()
  
  activities?.forEach((act) => {
    const userList = usersToRemind.get(act.user_id) || []
    userList.push(act)
    usersToRemind.set(act.user_id, userList)
  })

  // Mock sending emails
  console.log(`Sending reminders for ${usersToRemind.size} users today...`)
  usersToRemind.forEach((acts, userId) => {
    console.log(`User ${userId} has ${acts.length} repitions scheduled for today.`)
    // TODO: implement Resend or preferred Email provider here
  })

  return NextResponse.json({ success: true, count: activities?.length || 0 })
}
