'use client'

import { Activity } from '@/types/index'
import { deleteActivity } from '@/app/actions/activities'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function ActivityList({ activities }: { activities: Activity[] }) {
  const [isPending, startTransition] = useTransition()

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring" }}
        className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground border border-dashed border-border/50 rounded-2xl m-2"
      >
        <p className="font-medium">Nessuna attività programmata.</p>
        <p className="text-sm mt-1 opacity-70">Seleziona un giorno per iniziare.</p>
      </motion.div>
    )
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteActivity(id)
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 relative px-2 pb-4"
    >
      <AnimatePresence>
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            layout
            variants={itemVariants}
            exit={{ opacity: 0, scale: 0.8, x: -20, transition: { duration: 0.2 } }}
            className="p-5 rounded-3xl glass-card group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex gap-2 flex-wrap">
                {activity.is_repetition && (
                  <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    Ripetizione
                  </span>
                )}
                {activity.is_exercise && (
                  <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 shadow-[0_0_10px_rgba(163,230,53,0.3)]">
                    Esercizi
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 sm:group-hover:opacity-100 text-destructive hover:text-destructive-foreground hover:bg-destructive rounded-full transition-all active:scale-90 shadow-lg"
                onClick={() => handleDelete(activity.id)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="font-extrabold text-xl text-foreground mb-1 mt-1 relative z-10 tracking-tight">{activity.subject}</h3>
            {activity.notes && (
              <p className="text-sm text-foreground/70 mt-2 line-clamp-3 leading-relaxed relative z-10">
                {activity.notes}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
