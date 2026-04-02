'use client'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-6">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative w-20 h-20 rounded-3xl bg-card/60 border border-border/50 backdrop-blur-2xl flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse-slow" />
        <Brain className="w-10 h-10 text-primary animate-pulse relative z-10" />
      </motion.div>
    </div>
  )
}
