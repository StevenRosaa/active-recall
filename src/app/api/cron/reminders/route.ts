import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

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

  // Send real push notifications
  let sentCount = 0
  let failedCount = 0

  for (const [userId, acts] of usersToRemind) {
    // Fetch the user's push subscription
    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (!subs || subs.length === 0) continue

    const payload = JSON.stringify({
      title: 'Sessioni di Studio',
      body: `Hai ${acts.length} session${acts.length === 1 ? 'e' : 'i'} di Active Recall programmat${acts.length === 1 ? 'a' : 'e'} per oggi!`,
      icon: '/icons/icon-192x192.png',
      url: '/dashboard',
    })

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
        sentCount++
      } catch (err: any) {
        console.error(`Push failed for user ${userId}:`, err.statusCode || err)
        failedCount++

        // Remove expired subscriptions (410 Gone or 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id)
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    activitiesCount: activities?.length || 0,
    notificationsSent: sentCount,
    notificationsFailed: failedCount,
  })
}
