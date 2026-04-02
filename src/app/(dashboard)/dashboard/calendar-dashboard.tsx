'use client'

import { useState } from 'react'
import { Activity } from '@/types/index'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import ActivityDetailsDialog from '@/components/activity-details-dialog'
import { FocusSessionOverlay } from '@/components/focus-session-overlay'
import { motion } from 'framer-motion'

export default function CalendarDashboard({ initialActivities }: { initialActivities: Activity[] }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null)
  const [focusSessionActivity, setFocusSessionActivity] = useState<Activity | null>(null)

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i))
  const hours = Array.from({ length: 24 }).map((_, i) => `${i.toString().padStart(2, '0')}:00`)

  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1))
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1))
  const handleToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const getActivityStyle = (activity: Activity) => {
    if (!activity.time_start || !activity.time_end) return { display: 'none' }

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number)
      return h + (m || 0) / 60
    }

    // RIMOSSO IL BUFFER DI 30px! Ora tutto si allinea matematicamente allo 0
    const top = parseTime(activity.time_start) * 60
    const bottom = parseTime(activity.time_end) * 60
    const height = Math.max(bottom - top, 20)

    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.4 } }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full h-full flex flex-col relative gap-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between z-10 shrink-0 px-1">
        <h2 className="text-xl md:text-3xl font-bold capitalize tracking-tight text-foreground drop-shadow-md">
          {format(weekDays[0], 'd MMM', { locale: it })} - {format(weekDays[6], 'd MMM yyyy', { locale: it })}
        </h2>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
          <Button variant="outline" size="sm" onClick={handleToday} className="bg-card/30 backdrop-blur-md border-border hover:bg-accent hover:text-accent-foreground font-semibold rounded-lg h-9 md:h-10 px-4 shadow-lg shadow-black/10 text-foreground">
            Oggi
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek} className="bg-card/30 backdrop-blur-md border-border hover:bg-accent hover:text-accent-foreground rounded-lg h-9 w-9 md:h-10 md:w-10 text-foreground shadow-lg shadow-black/10">
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek} className="bg-card/30 backdrop-blur-md border-border hover:bg-accent hover:text-accent-foreground rounded-lg h-9 w-9 md:h-10 md:w-10 text-foreground shadow-lg shadow-black/10">
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Contenitore Griglia in stile Glassmorphism */}
      <motion.div variants={itemVariants} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10 border border-border rounded-xl md:rounded-3xl bg-background/40 backdrop-blur-2xl shadow-2xl shadow-black/20">

        <div className="grid grid-cols-[35px_repeat(7,minmax(0,1fr))] md:grid-cols-[60px_repeat(7,minmax(0,1fr))] w-full">

          {/* Angolo in alto a sx fisso */}
          <div className="sticky top-0 left-0 z-50 bg-background/60 backdrop-blur-xl border-b border-r border-border" />

          {/* Intestazione Giorni */}
          {weekDays.map(day => {
            const isToday = isSameDay(day, new Date())
            return (
              <div key={day.toISOString()} className={`sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-r border-border/50 p-1 md:p-3 text-center transition-colors ${isToday ? 'bg-primary/10 border-primary/20' : ''}`}>
                <p className={`text-[9px] md:text-xs uppercase font-bold tracking-wider ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  <span className="md:hidden">{format(day, 'eeeee', { locale: it })}</span>
                  <span className="hidden md:inline">{format(day, 'EEE', { locale: it })}</span>
                </p>
                <p className={`text-sm md:text-2xl font-semibold mt-0 md:mt-0.5 ${isToday ? 'text-foreground' : 'text-foreground/80'}`}>
                  {format(day, 'd')}
                </p>
              </div>
            )
          })}

          {/* Corpo del Calendario */}
          <div className="relative col-span-full grid grid-cols-[35px_repeat(7,minmax(0,1fr))] md:grid-cols-[60px_repeat(7,minmax(0,1fr))] h-[1440px]">

            {/* 24 Linee Orizzontali (da 0 a 23) */}
            {hours.map((hour, i) => (
              <div key={hour} className="col-span-full border-t border-border/50 absolute w-full" style={{ top: `${i * 60}px` }} />
            ))}

            {/* Colonna Orari Sticky a sinistra */}
            <div className="sticky left-0 border-r border-border bg-background/40 backdrop-blur-xl z-30">
              {hours.map((hour, i) => (
                <div
                  key={hour}
                  className="absolute w-full text-right pr-1 md:pr-2 text-[8px] md:text-[10px] font-semibold text-muted-foreground select-none"
                  style={{ top: `${i * 60}px`, paddingTop: '4px' }}
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Colonne dei Giorni con Attività */}
            {weekDays.map((day, dayIndex) => {
              const dayActivities = initialActivities.filter(a => isSameDay(new Date(a.date), day) && a.time_start && a.time_end)

              return (
                <div key={dayIndex} className="relative border-r border-border/50 last:border-r-0">
                  {dayActivities.map(activity => (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedEvent(activity)}
                      className={`absolute left-0.5 right-0.5 md:left-1.5 md:right-1.5 rounded-md md:rounded-lg p-1.5 md:p-2.5 overflow-hidden border transition-all cursor-pointer shadow-lg 
                        ${activity.is_completed 
                          ? 'opacity-60 grayscale bg-card/40 border-border/50 text-muted-foreground' 
                          : 'hover:z-[100] ' + (
                            activity.is_repetition ? 'bg-primary/20 backdrop-blur-md border-primary/30 text-primary-50 hover:bg-primary/30 hover:border-primary/50' :
                            activity.is_exercise ? 'bg-accent/20 backdrop-blur-md border-accent/30 text-accent hover:bg-accent/30 hover:border-accent/50' :
                              'bg-card/60 backdrop-blur-md border-border text-foreground hover:bg-card/80'
                          )
                        }`}
                      style={getActivityStyle(activity)}
                    >
                      <h4 className={`font-bold text-[8px] md:text-xs tracking-tight leading-tight truncate md:line-clamp-2 md:whitespace-normal drop-shadow-sm flex items-start gap-1`}>
                        {activity.is_completed && <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 text-emerald-500 mt-0.5" />}
                        <span className={activity.is_completed ? 'line-through' : ''}>{activity.subject}</span>
                      </h4>
                      <p className="hidden md:block text-[9px] opacity-80 mt-1 font-medium">
                        {activity.time_start} - {activity.time_end}
                      </p>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <ActivityDetailsDialog 
        activity={selectedEvent} 
        open={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        onStartSession={() => {
          setFocusSessionActivity(selectedEvent)
          setSelectedEvent(null)
        }}
      />
      <FocusSessionOverlay
        activity={focusSessionActivity}
        isOpen={!!focusSessionActivity}
        onClose={() => setFocusSessionActivity(null)}
      />
    </motion.div>
  )
}