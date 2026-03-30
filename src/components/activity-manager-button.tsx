'use client'

import { useState } from 'react'
import { Activity } from '@/types/index'
import ActivityManagerDialog from './activity-manager-dialog'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'

export default function ActivityManagerButton({ activities }: { activities: Activity[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground rounded-[1rem] transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] font-black text-xs md:text-sm tracking-widest px-4 md:px-6 h-10 md:h-12"
      >
        <Settings2 className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">GESTIONE ATTIVITÀ</span>
      </Button>
      <ActivityManagerDialog open={open} onOpenChange={setOpen} activities={activities} />
    </>
  )
}
