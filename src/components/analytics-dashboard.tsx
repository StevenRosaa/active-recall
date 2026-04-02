'use client'

import { motion } from 'framer-motion'
import { Flame, Clock, CheckCircle2 } from 'lucide-react'

export default function AnalyticsDashboard({ initialData }: { initialData: any }) {
  const { totalHours, completedSessions, currentStreak, heatmapData, weeklyData } = initialData

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  }

  // 7-Day Bar Chart logic
  const maxWeeklyMinutes = Math.max(
    ...weeklyData.flatMap((d: any) => [d.planned, d.actual]), 1
  )

  // Heatmap logic (last 90 days)
  const daysInHeatmap = 90
  const heatmapCells = []
  
  const getLocalDateStr = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - (offset * 60 * 1000))
    return local.toISOString().split('T')[0]
  }

  const oldestDate = new Date()
  oldestDate.setDate(oldestDate.getDate() - (daysInHeatmap - 1))
  const oldestDayOfWeek = oldestDate.getDay() === 0 ? 6 : oldestDate.getDay() - 1

  const paddedCells = Array(oldestDayOfWeek).fill({ isEmpty: true })

  for (let i = daysInHeatmap - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dStr = getLocalDateStr(d)
    const mins = heatmapData[dStr] || 0
    let intensityClass = 'bg-background/50 border-border/50'
    if (mins > 0 && mins <= 25) intensityClass = 'bg-primary/40 border-primary/20'
    else if (mins > 25 && mins <= 60) intensityClass = 'bg-primary/70 border-primary/40'
    else if (mins > 60) intensityClass = 'bg-primary border-primary'
    
    heatmapCells.push({ date: dStr, intensityClass, mins })
  }

  const allCells = [...paddedCells, ...heatmapCells]

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 h-full overflow-y-auto custom-scrollbar px-2"
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm">Statistiche</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border/50 flex flex-col gap-4 shadow-xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-500">
              <Flame className="w-6 h-6" />
            </div>
            <span className="font-semibold text-muted-foreground">Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black text-foreground tracking-tighter">{currentStreak}</span>
            <span className="text-xl font-bold text-muted-foreground">giorni</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border/50 flex flex-col gap-4 shadow-xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-primary/20 text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <span className="font-semibold text-muted-foreground">Ore Totali</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black text-foreground tracking-tighter">{totalHours}</span>
            <span className="text-xl font-bold text-muted-foreground">ore</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border/50 flex flex-col gap-4 shadow-xl shadow-black/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="font-semibold text-muted-foreground">Sessioni Completate</span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-black text-foreground tracking-tighter">{completedSessions}</span>
          </div>
        </motion.div>
      </div>

      {/* Weekly Bar Chart */}
      <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border/50 flex flex-col shadow-xl shadow-black/5 relative mt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-3xl" />
        
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-xl font-bold text-foreground">Ultimi 7 Giorni</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-card border border-border/50" />
              <span className="text-muted-foreground">Pianificato</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[3px] bg-primary border border-primary/20 shadow-[0_0_8px_rgba(168,85,247,0.3)]" />
              <span className="text-foreground">Effettivo</span>
            </div>
          </div>
        </div>

        {/* Bar chart area with grid lines */}
        <div className="h-64 w-full relative z-10 mt-10 px-2">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[100, 75, 50, 25, 0].map((pct) => (
              <div key={pct} className="flex items-center gap-2 w-full">
                <span className="text-[10px] font-medium text-muted-foreground/50 w-8 text-right shrink-0">
                  {Math.round((maxWeeklyMinutes * pct) / 100)}
                </span>
                <div className="flex-1 border-t border-border/30" />
              </div>
            ))}
          </div>

          {/* Bars container — positioned over the grid */}
          <div className="absolute inset-0 pl-10 flex items-end justify-between gap-3">
            {weeklyData.map((d: any, idx: number) => {
              const isToday = idx === weeklyData.length - 1
              const plannedPct = d.planned > 0 ? Math.max((d.planned / maxWeeklyMinutes) * 100, 3) : 0
              const actualPct = d.actual > 0 ? Math.max((d.actual / maxWeeklyMinutes) * 100, 3) : 0

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-default active:scale-[0.97] transition-transform" tabIndex={0}>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 text-foreground text-xs font-bold opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:group-focus-within:opacity-100 transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none shadow-xl flex flex-col gap-1 translate-y-2 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:none)]:group-focus-within:translate-y-0">
                    <span className="text-muted-foreground font-medium border-b border-border/50 pb-1 mb-0.5 text-center">{d.day}</span>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground font-medium">Pianificato:</span>
                      <span>{d.planned} min</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-primary font-medium">Effettivo:</span>
                      <span className="text-primary">{d.actual} min</span>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border/50" />
                  </div>

                  {/* Bars cluster */}
                  <div className="flex items-end gap-1 w-full justify-center" style={{ height: '100%' }}>
                    <div
                      style={{ height: `${plannedPct}%` }}
                      className="w-full max-w-[18px] rounded-t-lg transition-all duration-500 ease-out min-h-[6px] bg-card/80 border border-b-0 border-border/50 group-hover:bg-accent"
                    />
                    <div
                      style={{ height: `${actualPct}%` }}
                      className={`w-full max-w-[18px] rounded-t-lg transition-all duration-500 ease-out min-h-[6px] shadow-sm ${isToday ? 'bg-primary shadow-primary/30' : 'bg-primary/50 group-hover:bg-primary/80'}`}
                    />
                  </div>

                  {/* Day label */}
                  <span className={`text-xs font-semibold mt-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* GitHub Style Heatmap */}
      <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl bg-card/30 backdrop-blur-3xl border border-border/50 flex flex-col gap-6 shadow-xl shadow-black/5 relative mt-4">
        <h2 className="text-xl font-bold text-foreground relative z-10">Mappa di Costanza</h2>
        
        <div className="w-full overflow-x-auto custom-scrollbar pb-4 pt-12 -mx-2 px-2 -mt-6">
          <div className="grid grid-flow-col gap-1.5 auto-cols-max" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
            {allCells.map((cell: any, i: number) => {
              if (cell.isEmpty) {
                return <div key={`empty-${i}`} className="w-4 h-4 rounded-[4px]" />
              }
              return (
                <div 
                  key={cell.date} 
                  className={`relative group w-4 h-4 rounded-[4px] border border-background transition-all hover:scale-125 active:scale-110 hover:z-20 ${cell.intensityClass}`}
                  tabIndex={0}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background/95 backdrop-blur-md text-foreground text-[10px] font-bold rounded-lg border border-border/50 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:group-focus-within:opacity-100 transition-opacity pointer-events-none z-[100] whitespace-nowrap shadow-xl">
                    {cell.date}: {cell.mins} min
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-border/50" />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex w-full justify-end items-center gap-2 mt-4 text-xs font-semibold text-muted-foreground">
            <span>Meno</span>
            <div className="w-3 h-3 rounded-[3px] bg-background/50 border border-border/50" />
            <div className="w-3 h-3 rounded-[3px] bg-primary/40 border-primary/20" />
            <div className="w-3 h-3 rounded-[3px] bg-primary/70 border-primary/40" />
            <div className="w-3 h-3 rounded-[3px] bg-primary border-primary" />
            <span>Più</span>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
