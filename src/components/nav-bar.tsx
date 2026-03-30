import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import ActivityManagerButton from './activity-manager-button'
import UserMenu from './user-menu'

export default async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let activities: any[] = []
  if (user) {
    const { data } = await supabase.from('activities').select('*')
    if (data) activities = data
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      {/* Sfondo più trasparente (40%) per far risaltare gli orb luminosi dietro */}
      <nav className="rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between border border-border/50 bg-background/40 backdrop-blur-3xl shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-primary drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block text-foreground">Active Recall</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <ActivityManagerButton activities={activities} />
              <div className="h-6 w-px bg-border hidden md:block mx-1" />
              <UserMenu user={user} signOutAction={signOut} />
            </>
          ) : null}
        </div>
      </nav>
    </div>
  )
}