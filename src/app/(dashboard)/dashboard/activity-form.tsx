'use client'

import { addActivity } from '@/app/actions/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { useTransition, useState, useEffect } from 'react'
import { DateRange } from 'react-day-picker'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const AnimatedCheckbox = ({ id, name, defaultChecked = false, label }: { id: string, name: string, defaultChecked?: boolean, label: string }) => {
  const [checked, setChecked] = useState(defaultChecked)
  return (
    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setChecked(!checked)}>
      <input type="checkbox" id={id} name={name} checked={checked} readOnly className="hidden" />
      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors border-2 ${checked ? 'bg-primary border-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'border-border/50 group-hover:border-border bg-card/20'}`}>
        <motion.svg
          initial={false}
          animate={{ opacity: checked ? 1 : 0, scale: checked ? 1 : 0.5 }}
          className="w-4 h-4 text-background"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            d="M20 6L9 17l-5-5"
          />
        </motion.svg>
      </div>
      <Label htmlFor={id} className="text-sm font-bold tracking-wide cursor-pointer select-none text-foreground/90">{label}</Label>
    </div>
  )
}

export default function ActivityFormDialog({
  open,
  onOpenChange,
  date,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: DateRange | Date | undefined
}) {
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [open])

  if (!open) return null

  let fromDate: Date | undefined
  let toDate: Date | undefined

  if (date instanceof Date) {
    fromDate = date
  } else if (date?.from) {
    fromDate = date.from
    toDate = date.to
  }

  const isRange = !!toDate && fromDate !== toDate

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      if (fromDate) formData.set('dateFrom', format(fromDate, 'yyyy-MM-dd'))
      if (toDate) formData.set('dateTo', format(toDate, 'yyyy-MM-dd'))
      await addActivity(formData)
      onOpenChange(false)
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div 
        layoutId="form-modal-container"
        className="w-full max-w-lg glass-card rounded-[2rem] p-8 md:p-10 relative z-10 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border"
      >
        <button 
          onClick={() => onOpenChange(false)}
          type="button"
          className="absolute top-6 right-6 text-foreground/50 hover:text-foreground transition-colors hover:bg-accent p-2 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 pr-12">
          <h2 className="text-3xl font-black bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Nuova Sessione
          </h2>
          <p className="text-sm text-foreground/60 mt-2 font-medium">
            {isRange 
              ? `Dal ${format(fromDate!, 'd MMM yyyy')} al ${format(toDate!, 'd MMM yyyy')}`
              : fromDate ? `Programma per il ${format(fromDate, 'd MMM yyyy')}` : ''}
          </p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject" className="font-black text-xs uppercase tracking-widest text-primary">Materia / Argomento</Label>
            <Input id="subject" name="subject" required placeholder="Es. Anatomia - Sistema Nervoso" className="bg-card/30 border-border focus-visible:ring-primary rounded-xl h-12 text-lg shadow-inner text-foreground" />
          </div>
          
          <div className="flex gap-8 p-6 rounded-2xl bg-card/30 border border-border/50 shadow-inner">
            <AnimatedCheckbox id="is_repetition" name="is_repetition" defaultChecked label="RIPETIZIONE" />
            <AnimatedCheckbox id="is_exercise" name="is_exercise" label="ESERCIZI" />
          </div>
          
          {!isRange && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrence" className="font-black text-xs uppercase tracking-widest text-accent">Ricorsività</Label>
              <Select name="recurrence" required defaultValue="nessuna">
                <SelectTrigger className="bg-card/30 border-border rounded-xl h-12 shadow-inner text-foreground">
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-border rounded-xl text-foreground">
                  <SelectItem value="nessuna">Singola Sessione</SelectItem>
                  <SelectItem value="giornaliera">Ogni giorno (30gg)</SelectItem>
                  <SelectItem value="settimanale">Ogni settimana (12 sett.)</SelectItem>
                  <SelectItem value="active_recall">Active Recall (Day 1, 3, 7, 21)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="font-black text-xs uppercase tracking-widest text-foreground/50">Note Aggiuntive</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Appunti, link, riferimenti..."
              className="resize-none bg-card/30 border-border rounded-xl focus-visible:ring-primary shadow-inner text-foreground"
              rows={3}
            />
          </div>
          
          <Button type="submit" disabled={isPending} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all mt-4 hover:scale-[1.02]">
            {isPending ? 'Salvataggio...' : 'Conferma'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
