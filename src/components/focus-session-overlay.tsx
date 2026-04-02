'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Check, X, Timer } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Activity } from '@/types'
import { saveSessionDuration } from '@/app/actions/activities'
import { useFocusMode } from '@/components/focus-mode-context'

interface FocusSessionOverlayProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
}

export function FocusSessionOverlay({ activity, isOpen, onClose }: FocusSessionOverlayProps) {
  const { setIsFocusModeActive } = useFocusMode()

  // states
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState<number>(0)
  const [isPaused, setIsPaused] = useState(true)
  const [pausedTimeAccumulated, setPausedTimeAccumulated] = useState(0)
  const [lastPauseStart, setLastPauseStart] = useState<number | null>(null)
  
  const [isPending, setIsPending] = useState(false)

  const POMODORO_TARGET_MS = 25 * 60 * 1000

  // the logic for requestAnimationFrame absolute time
  useEffect(() => {
    if (!isOpen) return;
    
    let animationFrameId: number;
    
    const updateTimer = () => {
      if (!isPaused && startTime) {
        const now = Date.now()
        const elapsed = now - startTime - pausedTimeAccumulated
        
        if (timerMode === 'pomodoro' && elapsed >= POMODORO_TARGET_MS) {
          setElapsedMs(POMODORO_TARGET_MS)
          setIsPaused(true)
          setLastPauseStart(now)
        } else {
          setElapsedMs(elapsed)
          animationFrameId = requestAnimationFrame(updateTimer)
        }
      }
    }
    
    if (!isPaused && startTime) {
      animationFrameId = requestAnimationFrame(updateTimer)
    }
    return () => cancelAnimationFrame(animationFrameId)
  }, [isOpen, isPaused, startTime, pausedTimeAccumulated, timerMode])

  // format
  const formatTime = (ms: number, mode: 'stopwatch' | 'pomodoro') => {
    let displayMs = ms
    if (mode === 'pomodoro') {
      displayMs = Math.max(0, POMODORO_TARGET_MS - ms)
      // Per il pomodoro, aggiungiamo 999 per fare in modo che 25:00 scatti a 24:59 solo dopo un secondo esatto
      displayMs = displayMs > 0 ? displayMs + 999 : 0
    }
    
    const totalSeconds = Math.floor(displayMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    if (isPaused) {
      if (timerMode === 'pomodoro' && elapsedMs >= POMODORO_TARGET_MS) {
         // Se il pomodoro era finito, ricomincia
         setStartTime(Date.now())
         setElapsedMs(0)
         setPausedTimeAccumulated(0)
         setLastPauseStart(null)
      } else {
         const now = Date.now()
         if (!startTime) {
           setStartTime(now)
         } else if (lastPauseStart) {
           setPausedTimeAccumulated(prev => prev + (now - lastPauseStart))
           setLastPauseStart(null)
         }
      }
      setIsPaused(false)
    } else {
      // Pause
      setLastPauseStart(Date.now())
      setIsPaused(true)
    }
  }

  const handleFinish = async () => {
    if (!activity) return
    setIsPaused(true)
    // capture final time in minutes
    // Se ha studiato meno di 30s salva 0, altrimenti arrotonda al minuto più vicino
    const finalMinutes = Math.round(elapsedMs / 1000 / 60)
    
    setIsPending(true)
    try {
      await saveSessionDuration(activity.id, finalMinutes)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsPending(false)
    }
  }

  const resetTimerAndClose = () => {
    const confirmMessage = "Sei sicuro di voler annullare la sessione?\nIl tempo trascorso andrà perso."
    if (elapsedMs > 0 && !window.confirm(confirmMessage)) return
    
    setStartTime(null)
    setElapsedMs(0)
    setIsPaused(true)
    setPausedTimeAccumulated(0)
    setLastPauseStart(null)
    onClose()
  }

  // Reset silently only on unmount/hide if user didn't start another one
  useEffect(() => {
    if (!isOpen) { 
      setTimeout(() => {
        setStartTime(null)
        setElapsedMs(0)
        setIsPaused(true)
        setPausedTimeAccumulated(0)
        setLastPauseStart(null)
      }, 500)
    }
  }, [isOpen])

  // Sync with global state
  useEffect(() => {
    setIsFocusModeActive(isOpen)
  }, [isOpen, setIsFocusModeActive])

  return (
    <AnimatePresence>
      {isOpen && activity && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
           animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
           exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
           transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
           className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-background/95 backdrop-blur-3xl"
        >
          {/* Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl text-center px-4">
            
            {/* Modalità Timer */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="flex items-center gap-2 p-1 rounded-full bg-card/30 backdrop-blur-md border border-border/50 mb-8 z-10 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
            >
              <button 
                onClick={() => !startTime && setTimerMode('stopwatch')}
                disabled={startTime !== null}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  timerMode === 'stopwatch' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50 disabled:opacity-50 disabled:hover:bg-transparent'
                }`}
              >
                Cronometro
              </button>
              <button 
                onClick={() => !startTime && setTimerMode('pomodoro')}
                disabled={startTime !== null}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  timerMode === 'pomodoro' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50 disabled:opacity-50 disabled:hover:bg-transparent'
                }`}
              >
                Pomodoro (25 min)
              </button>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
               <Timer className="w-4 h-4" /> Focus Mode
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tight"
            >
              {activity.subject}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
               className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto"
            >
              {activity.notes || "Preparati a dare il massimo per questa sessione. Rimuovi le distrazioni e concentrati."}
            </motion.p>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="text-7xl sm:text-9xl md:text-[180px] font-black font-mono tracking-tighter text-foreground mb-12 drop-shadow-2xl"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTime(elapsedMs, timerMode)}
            </motion.div>

            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="flex items-center justify-center gap-6 h-32"
            >
               {startTime && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                   <Button 
                     variant="outline" 
                     size="icon" 
                     className="w-16 h-16 rounded-full border-2 border-destructive/50 hover:bg-destructive/20 hover:text-destructive bg-card/50 backdrop-blur-md transition-colors"
                     onClick={resetTimerAndClose}
                     title="Annulla Sessione"
                   >
                     <Square className="w-6 h-6" />
                   </Button>
                 </motion.div>
               )}

               <Button 
                 variant="outline"
                 size="icon"
                 className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 border-none shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-all transform active:scale-95 ${
                   isPaused 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30' 
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                 }`}
                 onClick={handleToggle}
               >
                 {isPaused ? <Play className="w-12 h-12 ml-2" /> : <Pause className="w-12 h-12" />}
               </Button>

               {startTime && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                   <Button 
                     variant="outline" 
                     size="icon" 
                     disabled={isPending}
                     className="w-16 h-16 rounded-full border-2 border-success/50 hover:bg-success/20 text-success bg-success/5 backdrop-blur-md transition-colors"
                     onClick={handleFinish}
                     title="Salva Sessione"
                   >
                     <Check className="w-6 h-6" />
                   </Button>
                 </motion.div>
               )}
            </motion.div>

            {isPending && (
              <p className="mt-8 text-sm text-muted-foreground animate-pulse">Salvataggio sessione e completamento tracciato...</p>
            )}
            {timerMode === 'pomodoro' && elapsedMs >= POMODORO_TARGET_MS && !isPending && (
              <p className="mt-8 text-sm font-bold text-primary animate-bounce">Tocca Salva per completare il Pomodoro!</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
