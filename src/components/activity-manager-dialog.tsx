'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Activity } from '@/types/index'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Edit2, Plus, Trash2, Calendar as CalendarIcon, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { deleteActivity } from '@/app/actions/activities'
import ActivityFormDialog from './activity-form'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActivityManagerDialog({
  activities, open, onOpenChange
}: {
  activities: Activity[], open: boolean, onOpenChange: (open: boolean) => void
}) {
  const [view, setView] = useState<'menu' | 'add' | 'edit-list' | 'delete-list'>('menu')
  const [search, setSearch] = useState('')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleClose = () => {
    setView('menu')
    setSelectedActivity(null)
    onOpenChange(false)
  }

  if (!mounted) return null

  const filteredActivities = activities
    .filter(a => a.subject.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const groupedActivities = useMemo(() => {
    const groups = new Map<string, Activity[]>()
    const singles: Activity[] = []

    filteredActivities.forEach(act => {
      if (act.series_id) {
        if (!groups.has(act.series_id)) {
          groups.set(act.series_id, [])
        }
        groups.get(act.series_id)!.push(act)
      } else {
        singles.push(act)
      }
    })

    const result = [
      ...Array.from(groups.values()).map(group => {
        const sortedGroup = group.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return {
          id: sortedGroup[0].series_id!,
          isGroup: true,
          subject: sortedGroup[0].subject,
          count: group.length,
          activities: sortedGroup,
          firstDate: sortedGroup[0],
        }
      }),
      ...singles.map(act => ({
        id: act.id,
        isGroup: false,
        subject: act.subject,
        count: 1,
        activities: [act],
        firstDate: act,
      }))
    ]

    return result.sort((a, b) => new Date(b.firstDate.date).getTime() - new Date(a.firstDate.date).getTime())
  }, [filteredActivities])

  const layoutDuration = 0.4;
  const exitDuration = 0.2;

  const renderContent = () => {
    if (view === 'add' || selectedActivity) {
      return (
        <ActivityFormDialog
          existingActivities={activities}
          initialData={selectedActivity}
          onSuccess={handleClose}
          onBack={() => {
            setSelectedActivity(null)
            setView('menu')
          }}
        />
      )
    }

    if (view === 'edit-list' || view === 'delete-list') {
      return (
        <div className="flex flex-col h-[60vh] md:h-[500px]">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setView('menu')} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4">
              ← Indietro
            </Button>
            <h3 className="text-xl font-semibold text-foreground">
              {view === 'edit-list' ? 'Modifica' : 'Elimina'} Sessione
            </h3>
          </div>
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per materia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground"
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
            {groupedActivities.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10 font-medium text-sm">Nessuna attività trovata.</p>
            ) : (
              groupedActivities.map(group => (
                <div
                  key={group.id}
                  className="p-3 md:p-4 rounded-xl flex items-center justify-between group-hover border border-border/50 bg-card/40 hover:bg-accent/80 hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-foreground text-sm tracking-tight break-words">{group.subject}</h4>
                    <div className="mt-1">
                      {group.isGroup ? (
                        <span className="inline-flex items-center rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary-100 ring-1 ring-inset ring-primary/30">
                          {group.count} sessioni programmate
                        </span>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(group.firstDate.date), 'dd MMM yyyy', { locale: it })}
                          {group.firstDate.time_start && ` • ${group.firstDate.time_start} - ${group.firstDate.time_end}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant={view === 'edit-list' ? 'secondary' : 'destructive'}
                    className={`rounded-lg transition-colors h-9 w-9 shrink-0 ${view === 'delete-list' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (view === 'edit-list') {
                        setSelectedActivity(group.activities[0])
                      } else {
                        await deleteActivity(group.activities.map(a => a.id))
                      }
                    }}
                  >
                    {view === 'edit-list' ? <Edit2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center p-2 gap-4 w-full">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-4">Area Gestione</h2>
        <Button onClick={() => setView('add')} className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> NUOVA SESSIONE
        </Button>
        <div className="flex w-full gap-3">
          <Button onClick={() => setView('edit-list')} variant="outline" className="flex-1 h-14 rounded-xl bg-card/50 border border-border hover:bg-accent text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
            <Edit2 className="w-4 h-4" /> MODIFICA
          </Button>
          <Button onClick={() => setView('delete-list')} variant="outline" className="flex-1 h-14 rounded-xl bg-card/50 border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
            <Trash2 className="w-4 h-4" /> ELIMINA
          </Button>
        </div>
      </div>
    )
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: exitDuration, duration: 0.2 } }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            layout // Il contenitore fa il morphing
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15, transition: { delay: exitDuration, duration: 0.2 } }}
            transition={{ layout: { type: "spring", bounce: 0.1, duration: layoutDuration }, default: { duration: 0.3 } }}
            className="rounded-[2rem] p-4 sm:p-6 md:p-8 relative z-10 w-full max-w-md border border-border bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col justify-center min-h-[300px]"
          >
            <button onClick={handleClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-all active:scale-90 hover:bg-accent p-2 rounded-full z-20">
              <X className="w-4 h-4" />
            </button>

            {/* Contenitore di supporto per l'allineamento */}
            <div className="flex w-full max-w-full flex-1 items-center justify-center relative overflow-x-hidden">

              {/* Torniamo a popLayout per evitare i collassi a scatti del DOM */}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={view + (selectedActivity?.id || '')}

                  // IL SEGRETO È QUI: 
                  // Dando 'layout' anche al figlio, Framer Motion aggiorna dinamicamente 
                  // la sua posizione absolute mentre il padre si restringe, tenendolo perfettamente centrato!
                  layout

                  variants={{
                    hidden: {
                      opacity: 0,
                      scale: 0.5,
                      filter: 'blur(10px)'
                    },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      filter: 'blur(0px)',
                      transition: {
                        type: "spring",
                        bounce: 0.5,
                        duration: 0.5,
                        delay: 0.15 // Aspetta che il padre abbia iniziato il morphing
                      }
                    },
                    exit: {
                      opacity: 0,
                      scale: 0.4,
                      filter: 'blur(10px)',
                      transition: {
                        duration: exitDuration,
                        ease: "easeIn"
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-full flex flex-col justify-center origin-center overflow-x-hidden"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}