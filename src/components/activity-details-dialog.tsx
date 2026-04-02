'use client'

import { useState, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { Activity } from '@/types/index'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { X, Calendar as CalendarIcon, Clock, Edit2, Trash2, CheckCircle2, RotateCcw, AlertTriangle, FileText, Play } from 'lucide-react'
import { toggleActivityCompletion, updateActivityNotes, deleteActivity } from '@/app/actions/activities'
import { motion, AnimatePresence } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'

export default function ActivityDetailsDialog({
  activity, open, onClose, onStartSession
}: {
  activity: Activity | null, open: boolean, onClose: () => void, onStartSession?: () => void
}) {
  const [view, setView] = useState<'view' | 'edit-notes' | 'delete'>('view')
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (activity && open) {
      setView('view')
      setNotes(activity.notes || '')
    }
  }, [activity, open])

  if (!mounted) return null

  const springConfig = { type: "spring" as const, bounce: 0.15, duration: 0.4 }

  const handleClose = () => {
    if (isPending) return
    onClose()
  }

  const handleToggleCompletion = () => {
    if (!activity) return
    startTransition(async () => {
      await toggleActivityCompletion(activity.id, !activity.is_completed)
      onClose()
    })
  }

  const handleSaveNotes = () => {
    if (!activity) return
    startTransition(async () => {
      await updateActivityNotes(activity.id, notes)
      setView('view')
    })
  }

  const handleDelete = (deleteSeries: boolean) => {
    if (!activity) return
    startTransition(async () => {
      if (deleteSeries && activity.series_id) {
        await deleteActivity(activity.series_id, true)
      } else {
        await deleteActivity(activity.id)
      }
      onClose()
    })
  }

  const renderContent = () => {
    if (!activity) return null

    if (view === 'edit-notes') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setView('view')} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4">
              ← Indietro
            </Button>
            <h3 className="text-xl font-semibold text-foreground">Modifica Note</h3>
          </div>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Scrivi qui i tuoi appunti..." 
            className="min-h-[150px] bg-background/50 border-border rounded-xl focus-visible:ring-primary text-sm text-foreground resize-none"
          />
          <Button 
            onClick={handleSaveNotes} 
            disabled={isPending} 
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform active:scale-95"
          >
            {isPending ? 'Salvataggio...' : 'Salva Note'}
          </Button>
        </div>
      )
    }

    if (view === 'delete') {
      return (
        <div className="flex flex-col gap-4 items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Sei sicuro?</h3>
          <p className="text-sm text-muted-foreground mb-4">L'eliminazione è irreversibile.</p>
          
          <div className="flex flex-col gap-3 w-full">
            {activity.series_id ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleDelete(false)} 
                  disabled={isPending} 
                  className="w-full h-12 rounded-xl bg-card/50 hover:bg-destructive/20 hover:text-destructive border-border hover:border-destructive/30 text-foreground font-medium transition-colors"
                >
                  Elimina solo questa sessione
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(true)} 
                  disabled={isPending} 
                  className="w-full h-12 rounded-xl font-bold transition-colors"
                >
                  Elimina intera serie
                </Button>
              </>
            ) : (
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(false)} 
                disabled={isPending} 
                className="w-full h-12 rounded-xl font-bold transition-colors"
              >
                Elimina sessione
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => setView('view')} 
              disabled={isPending} 
              className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground mt-2 transition-colors hover:bg-accent"
            >
              Annulla
            </Button>
          </div>
        </div>
      )
    }

    // View mode
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {activity.is_repetition && (
              <span className="inline-flex items-center rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary-100 ring-1 ring-inset ring-primary/30">
                Ripetizione
              </span>
            )}
            {activity.is_exercise && (
              <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent ring-1 ring-inset ring-accent/30">
                Esercizi
              </span>
            )}
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold tracking-tight text-foreground transition-all break-words ${activity.is_completed ? 'line-through opacity-40' : ''}`}>
            {activity.subject}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/40 border border-border/50">
              <CalendarIcon className="w-4 h-4 text-primary" />
              {format(new Date(activity.date), 'dd MMMM yyyy', { locale: it })}
            </div>
            {activity.time_start && activity.time_end && (
               <div className="flex items-center gap-1.5 p-2 rounded-lg bg-card/40 border border-border/50">
                 <Clock className="w-4 h-4 text-accent" />
                 {activity.time_start} - {activity.time_end}
               </div>
            )}
          </div>
        </div>

        {notes && (
          <div className="p-4 rounded-xl bg-card/40 border border-border/50 relative group">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Note
            </h4>
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">{notes}</p>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setView('edit-notes')} 
              className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {!notes && (
          <Button 
            variant="outline" 
            onClick={() => setView('edit-notes')}
            className="w-full h-10 border-dashed border-border/50 bg-card/20 text-muted-foreground hover:text-foreground hover:bg-card/40 transition-colors"
          >
            + Aggiungi note
          </Button>
        )}

        <div className="flex flex-col gap-3 mt-2">
          {!activity.is_completed && onStartSession && (
            <Button
              onClick={onStartSession}
              disabled={isPending}
              className="w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <Play className="w-5 h-5 fill-current" /> Inizia Sessione
            </Button>
          )}
          <Button
            onClick={handleToggleCompletion}
            disabled={isPending}
            variant={activity.is_completed ? "outline" : "default"}
            className={`w-full h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activity.is_completed 
                ? 'bg-card/50 border-border text-foreground hover:bg-accent hover:text-accent-foreground' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
            }`}
          >
            {activity.is_completed ? (
              <>
                <RotateCcw className="w-5 h-5" /> Ripristina Sessione
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Segna come Completato
              </>
            )}
          </Button>
          
          <div className="flex w-full gap-3">
             <Button 
               onClick={() => setView('edit-notes')} 
               variant="outline" 
               className="flex-1 h-12 rounded-xl bg-card/50 border border-border hover:bg-accent font-medium text-sm flex items-center justify-center gap-2 text-foreground transition-transform active:scale-95"
             >
               <Edit2 className="w-4 h-4" /> NOTE
             </Button>
             <Button 
               onClick={() => setView('delete')} 
               variant="outline" 
               className="flex-1 h-12 rounded-xl bg-card/50 border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 font-medium text-sm flex items-center justify-center gap-2 text-foreground transition-transform active:scale-95"
             >
               <Trash2 className="w-4 h-4" /> ELIMINA
             </Button>
          </div>
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
            exit={{ opacity: 0, transition: { delay: 0.2, duration: 0.2 } }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15, transition: { delay: 0.2, duration: 0.2 } }}
            transition={{ layout: springConfig, default: { duration: 0.3 } }}
            className="rounded-[2rem] p-4 sm:p-6 md:p-8 relative z-10 w-full max-w-md border border-border bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col justify-center min-h-[300px]"
          >
            <button onClick={handleClose} disabled={isPending} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-all active:scale-90 hover:bg-accent p-2 rounded-full z-20">
              <X className="w-4 h-4" />
            </button>

            <div className="flex w-full max-w-full flex-1 items-center justify-center relative overflow-x-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={view + (activity?.id || '')}
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
                    visible: { 
                      opacity: 1, 
                      scale: 1, 
                      filter: 'blur(0px)',
                      transition: { ...springConfig, delay: 0.1 }
                    },
                    exit: { 
                      opacity: 0, 
                      scale: 0.9, 
                      filter: 'blur(10px)',
                      transition: { duration: 0.2, ease: "easeIn" }
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
