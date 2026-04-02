'use client'

import { addActivity, editActivity } from '@/app/actions/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransition, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, RecallProfile } from '@/types'
import { getRecallProfiles } from '@/app/actions/preferences'

const AnimatedCheckbox = ({ id, name, defaultChecked = false, label }: { id: string, name: string, defaultChecked?: boolean, label: string }) => {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setChecked(!checked)}>
      <input type="checkbox" id={id} name={name} checked={checked} readOnly className="hidden" />
      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${checked ? 'bg-primary border-primary' : 'border-border group-hover:border-primary bg-card text-foreground'}`}>
        <motion.svg
          initial={false}
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
          className="w-3.5 h-3.5 text-background"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            d="M20 6L9 17l-5-5"
          />
        </motion.svg>
      </div>
      <Label htmlFor={id} className="text-sm font-medium cursor-pointer select-none text-foreground">{label}</Label>
    </div>
  )
}

export default function ActivityFormDialog({ 
  existingActivities = [], 
  initialData, 
  onSuccess, 
  onBack 
}: { 
  existingActivities?: Activity[], 
  initialData?: Activity | null, 
  onSuccess: () => void, 
  onBack: () => void 
}) {
  const [isPending, startTransition] = useTransition()
  const [recurrence, setRecurrence] = useState('nessuna')
  const [timeStart, setTimeStart] = useState(initialData?.time_start || '')
  const [timeEnd, setTimeEnd] = useState(initialData?.time_end || '')
  
  const [profiles, setProfiles] = useState<RecallProfile[]>([])
  
  // Conflict States
  const [conflicts, setConflicts] = useState<{ id: string, date: string, conflictingSubject: string, newStartTime: string, newEndTime: string, originalObj: any }[]>([])
  const [pendingActivities, setPendingActivities] = useState<any[]>([])

  useEffect(() => {
    if (!initialData) {
      getRecallProfiles().then(setProfiles).catch(console.error)
    }
  }, [initialData])

  const isTimeValid = !timeStart || !timeEnd || timeStart < timeEnd

  const hasOverlap = (t1Start: string, t1End: string, t2Start: string, t2End: string) => {
    return t1Start < t2End && t1End > t2Start
  }

  const handleSubmit = (formData: FormData) => {
    if (!isTimeValid) return

    // Simulate dates generated
    const dateFrom = formData.get('dateFrom') as string
    const time_start = formData.get('time_start') as string || null
    const time_end = formData.get('time_end') as string || null
    const subject = formData.get('subject') as string
    const is_repetition = formData.get('is_repetition') === 'on'
    const is_exercise = formData.get('is_exercise') === 'on'
    const notes = formData.get('notes') as string
    const rec = formData.get('recurrence') as string || 'nessuna'
    const repsStr = formData.get('repetitions') as string
    const reps = repsStr ? parseInt(repsStr, 10) : 1

    const baseDate = new Date(dateFrom)
    const activitiesToInsert: any[] = []
    const isCustomProfile = rec.startsWith('custom_')
    const series_id = (rec !== 'nessuna' && (reps > 1 || isCustomProfile)) ? crypto.randomUUID() : null

    const createRecord = (targetDate: Date) => ({
      date: targetDate.toISOString().split('T')[0],
      time_start,
      time_end,
      subject,
      is_repetition,
      is_exercise,
      notes: notes || null,
      series_id
    })

    if (initialData) {
      // Editing single existing
      activitiesToInsert.push(createRecord(baseDate))
    } else {
      if (isCustomProfile) {
        const profileId = rec.replace('custom_', '')
        const profile = profiles.find(p => p.id === profileId)
        if (profile && profile.intervals) {
          activitiesToInsert.push(createRecord(baseDate))
          for (const interval of profile.intervals) {
            let current = new Date(baseDate)
            current.setDate(current.getDate() + interval)
            activitiesToInsert.push(createRecord(new Date(current)))
          }
        } else {
          activitiesToInsert.push(createRecord(baseDate))
        }
      } else if (rec === 'nessuna' || reps <= 1) {
        activitiesToInsert.push(createRecord(baseDate))
      } else {
        let current = new Date(baseDate)
        for (let i = 0; i < reps; i++) {
          activitiesToInsert.push(createRecord(new Date(current)))
          if (rec === 'giornaliera') current.setDate(current.getDate() + 1)
          else if (rec === 'settimanale') current.setDate(current.getDate() + 7)
          else if (rec === 'mensile') current.setMonth(current.getMonth() + 1)
          else if (rec === 'annuale') current.setFullYear(current.getFullYear() + 1)
        }
      }
    }

    // Checking Overlaps
    const localConflicts: any[] = []
    
    for (const newAct of activitiesToInsert) {
      const clashes = existingActivities.filter(ea => 
        ea.id !== initialData?.id &&
        ea.date === newAct.date && 
        ea.time_start && ea.time_end &&
        newAct.time_start && newAct.time_end &&
        hasOverlap(newAct.time_start, newAct.time_end, ea.time_start, ea.time_end)
      )
      
      if (clashes.length > 0) {
        localConflicts.push({
          id: crypto.randomUUID(),
          date: newAct.date,
          conflictingSubject: clashes.map(c => c.subject).join(', '),
          newStartTime: newAct.time_start,
          newEndTime: newAct.time_end,
          originalObj: newAct
        })
      }
    }

    if (localConflicts.length > 0) {
      setConflicts(localConflicts)
      setPendingActivities(activitiesToInsert)
      return
    }

    // No overlaps, execute
    executeSubmission(activitiesToInsert)
  }

  const executeSubmission = (activitiesArray: any[]) => {
    startTransition(async () => {
      if (initialData) {
        // Build a FormData since editActivity still expects FormData
        const fd = new FormData()
        const act = activitiesArray[0]
        fd.set('dateFrom', act.date)
        if (act.time_start) fd.set('time_start', act.time_start)
        if (act.time_end) fd.set('time_end', act.time_end)
        fd.set('subject', act.subject)
        if (act.is_repetition) fd.set('is_repetition', 'on')
        if (act.is_exercise) fd.set('is_exercise', 'on')
        if (act.notes) fd.set('notes', act.notes)
        
        await editActivity(initialData.id, fd)
      } else {
        // Send JSON for additions
        await addActivity(JSON.stringify(activitiesArray))
      }
      onSuccess()
    })
  }

  const handleResolveConflicts = () => {
    // Overwrite the specific times in pendingActivities
    const resolvedActivities = pendingActivities.map(pa => {
      const conflict = conflicts.find(c => c.date === pa.date && c.originalObj === pa)
      if (conflict) {
        return { ...pa, time_start: conflict.newStartTime, time_end: conflict.newEndTime }
      }
      return pa
    })

    // Validate new combinations
    const newClashes = []
    for (const newAct of resolvedActivities) {
      if (!newAct.time_start || !newAct.time_end || newAct.time_start >= newAct.time_end) {
        alert("Controlla gli orari modificati (Fine deve essere dopo Inizio).")
        return
      }

      const clashes = existingActivities.filter(ea => 
        ea.id !== initialData?.id &&
        ea.date === newAct.date && 
        ea.time_start && ea.time_end &&
        hasOverlap(newAct.time_start, newAct.time_end, ea.time_start, ea.time_end)
      )
      
      if (clashes.length > 0) {
        newClashes.push(newAct.date)
      }
    }

    if (newClashes.length > 0) {
      alert(`Ci sono ancora sovrapposizioni nelle date: ${newClashes.join(', ')}`)
      return
    }

    // Success
    executeSubmission(resolvedActivities)
  }

  const updateConflictTime = (id: string, field: 'newStartTime' | 'newEndTime', value: string) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  return (
    <div className="flex flex-col w-full max-w-full max-h-[80vh] min-h-[400px] relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0 relative z-10">
        <Button variant="ghost" size="sm" onClick={conflicts.length > 0 ? () => { setConflicts([]); setPendingActivities([]) } : onBack} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4">
          ← Indietro
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          {conflicts.length > 0 ? 'Risoluzione Conflitti' : initialData ? 'Modifica' : 'Nuova Sessione'}
        </h2>
      </div>

      <div className="relative flex-1 w-full flex flex-col min-h-0">
        <AnimatePresence mode="popLayout" initial={false}>
          {conflicts.length === 0 ? (
            <motion.form 
              key="main-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              action={handleSubmit} 
              className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar px-1 pb-2 h-full w-full"
            >
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject" className="text-xs text-muted-foreground">Argomento</Label>
          <Input id="subject" name="subject" defaultValue={initialData?.subject || ''} required placeholder="Es. Anatomia - Sistema Nervoso" className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">Data</Label>
            <Input type="date" id="dateFrom" name="dateFrom" required defaultValue={initialData?.date || ''} min={new Date().toISOString().split('T')[0]} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground block" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="time_start" className="text-xs text-muted-foreground">Inizio</Label>
                <Input type="time" id="time_start" name="time_start" required value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground block" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="time_end" className="text-xs text-muted-foreground">Fine</Label>
                <Input type="time" id="time_end" name="time_end" required value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground block" />
              </div>
            </div>
            {!isTimeValid && (
              <p className="text-xs text-destructive font-medium">L'orario di fine deve essere successivo all'inizio.</p>
            )}
          </div>
        </div>

        <div className="flex gap-6 p-4 rounded-xl bg-card/50 border border-border/50">
          <AnimatedCheckbox id="is_repetition" name="is_repetition" defaultChecked={initialData ? initialData.is_repetition : true} label="Ripetizione" />
          <AnimatedCheckbox id="is_exercise" name="is_exercise" defaultChecked={initialData?.is_exercise} label="Esercizi" />
        </div>

        {!initialData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrence" className="text-xs text-muted-foreground">Ricorsività</Label>
              <Select name="recurrence" required value={recurrence} onValueChange={(val) => setRecurrence(val || 'nessuna')}>
                <SelectTrigger className="bg-background/50 border-border rounded-xl h-11 text-sm text-foreground">
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent className="border-border rounded-xl z-[300] bg-popover/95 backdrop-blur-xl text-foreground">
                  <SelectItem value="nessuna">Evento Singolo</SelectItem>
                  {profiles.length > 0 && <div className="h-px bg-border my-1" />}
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={`custom_${p.id}`}>
                      {p.name}
                    </SelectItem>
                  ))}
                  {profiles.length > 0 && <div className="h-px bg-border my-1" />}
                  <SelectItem value="giornaliera">Giornaliera</SelectItem>
                  <SelectItem value="settimanale">Settimanale</SelectItem>
                  <SelectItem value="mensile">Mensile</SelectItem>
                  <SelectItem value="annuale">Annuale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurrence !== 'nessuna' && !recurrence.startsWith('custom_') && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-2">
                <Label htmlFor="repetitions" className="text-xs text-muted-foreground">Numero di ripetizioni</Label>
                <Input type="number" id="repetitions" name="repetitions" min="1" required defaultValue="10" className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground block" />
              </motion.div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-xs text-muted-foreground">Note</Label>
          <Textarea id="notes" name="notes" defaultValue={initialData?.notes || ''} placeholder="Appunti, link..." className="resize-none bg-background/50 border-border rounded-xl focus-visible:ring-primary min-h-[80px] text-sm text-foreground" />
        </div>

        <Button type="submit" disabled={isPending || !isTimeValid} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all active:scale-95 mt-2 shrink-0">
          {isPending ? 'Salvataggio...' : 'Conferma'}
        </Button>
            </motion.form>
          ) : (
            <motion.div
              key="conflict-ui"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar px-1 pb-2 h-full absolute inset-0 bg-background"
            >
              <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 mb-2 mt-2">
                <h3 className="text-sm font-bold text-destructive mb-1">Attenzione: {conflicts.length} conflitt{conflicts.length === 1 ? 'o' : 'i'} rilevat{conflicts.length === 1 ? 'o' : 'i'}</h3>
                <p className="text-xs text-destructive/80 font-medium tracking-tight">Queste sessioni si sovrappongono ad orari già occupati nel calendario. Modifica gli orari per procedere o annulla per tornare indietro.</p>
              </div>

              <div className="flex flex-col gap-3">
                {conflicts.map((c, i) => (
                  <div key={c.id} className="p-4 rounded-xl border border-border/50 bg-card/40 flex flex-col gap-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col relative z-10">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        {new Date(c.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium mt-0.5">Occupato da: <span className="text-foreground/80">"{c.conflictingSubject}"</span></span>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10 mt-1">
                      <div className="flex flex-col w-full">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Nuovo Inizio</Label>
                        <Input type="time" required value={c.newStartTime} onChange={e => updateConflictTime(c.id, 'newStartTime', e.target.value)} className="bg-background/50 h-10 text-xs border-border/50 focus-visible:ring-destructive" />
                      </div>
                      <div className="flex flex-col w-full">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Nuova Fine</Label>
                        <Input type="time" required value={c.newEndTime} onChange={e => updateConflictTime(c.id, 'newEndTime', e.target.value)} className="bg-background/50 h-10 text-xs border-border/50 focus-visible:ring-destructive" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 mb-4 pt-4 flex gap-3 shrink-0">
                <Button variant="outline" className="w-[120px] h-12 rounded-xl transition-all active:scale-95" onClick={() => { setConflicts([]); setPendingActivities([]) }}>Indietro</Button>
                <Button className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-sm transition-all active:scale-95" onClick={handleResolveConflicts} disabled={isPending}>
                  {isPending ? 'Salvataggio...' : 'Risolvi e Salva'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}