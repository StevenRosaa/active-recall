'use client'

import { addActivity, editActivity } from '@/app/actions/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransition, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity } from '@/types'

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

export default function ActivityFormDialog({ initialData, onSuccess, onBack }: { initialData?: Activity | null, onSuccess: () => void, onBack: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [recurrence, setRecurrence] = useState('nessuna')
  const [timeStart, setTimeStart] = useState(initialData?.time_start || '')
  const [timeEnd, setTimeEnd] = useState(initialData?.time_end || '')

  const isTimeValid = !timeStart || !timeEnd || timeStart < timeEnd

  const handleSubmit = (formData: FormData) => {
    if (!isTimeValid) return

    startTransition(async () => {
      if (initialData) {
        await editActivity(initialData.id, formData)
      } else {
        await addActivity(formData)
      }
      onSuccess()
    })
  }

  return (
    <div className="flex flex-col w-full max-h-[80vh]">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4">
          ← Indietro
        </Button>
        <h2 className="text-xl font-semibold text-foreground">
          {initialData ? 'Modifica' : 'Nuova Sessione'}
        </h2>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject" className="text-xs text-muted-foreground">Argomento</Label>
          <Input id="subject" name="subject" defaultValue={initialData?.subject || ''} required placeholder="Es. Anatomia - Sistema Nervoso" className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-sm text-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrence" className="text-xs text-muted-foreground">Ricorsività</Label>
              <Select name="recurrence" required value={recurrence} onValueChange={(val) => setRecurrence(val || 'nessuna')}>
                <SelectTrigger className="bg-background/50 border-border rounded-xl h-11 text-sm text-foreground">
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent className="border-border rounded-xl z-[300] bg-popover/95 backdrop-blur-xl text-foreground">
                  <SelectItem value="nessuna">Evento Singolo</SelectItem>
                  <SelectItem value="giornaliera">Giornaliera</SelectItem>
                  <SelectItem value="settimanale">Settimanale</SelectItem>
                  <SelectItem value="mensile">Mensile</SelectItem>
                  <SelectItem value="annuale">Annuale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {recurrence !== 'nessuna' && (
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

        <Button type="submit" disabled={isPending || !isTimeValid} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-transform hover:scale-[1.02] active:scale-95 mt-2 shrink-0">
          {isPending ? 'Salvataggio...' : 'Conferma'}
        </Button>
      </form>
    </div>
  )
}