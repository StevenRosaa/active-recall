'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Brain, Sparkles } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background relative overflow-hidden font-sans">
      {/* Background Aesthetic */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-black/5 dark:bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,transparent)] dark:[mask-image:linear-gradient(180deg,white,transparent)] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <header className="w-full flex items-center justify-between p-6 md:px-10 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
            <Brain className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tight text-foreground">Active Recall</span>
        </div>
        
        <div className="flex items-center gap-5">
          {mounted && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/30 border border-border backdrop-blur-md">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Tema</span>
              <Switch 
                withThemeIcon 
                checked={theme === 'dark'} 
                onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} 
                size="sm"
              />
            </div>
          )}
          <Link href="/login" className="h-11 px-6 inline-flex items-center justify-center rounded-xl font-bold bg-foreground text-background hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-black/10">
            Accedi
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center p-6 relative z-10 -mt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" /> La rivoluzione dello studio
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-6"
        >
          Studia Meno. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent filter drop-shadow-sm">Ricorda di Più.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl font-medium text-muted-foreground max-w-2xl mb-12"
        >
          Sfrutta il potere della ripetizione spaziata e dell'active recall 
          per ottimizzare la tua memoria e dominare i tuoi esami senza stress.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", bounce: 0.2, duration: 0.8, delay: 0.3 }}
           className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] group text-lg gap-2">
            Inizia Ora 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>

      {/* Graphic Elements / UI Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.1, duration: 1, delay: 0.4 }}
        className="w-full max-w-5xl mx-auto h-[30vh] sm:h-[40vh] md:h-96 rounded-t-[3rem] border border-border border-b-0 bg-card/60 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] relative z-10 overflow-hidden p-6 md:p-10 flex flex-col"
      >
        <div className="w-full h-8 flex items-center gap-2 mb-6">
           <div className="w-3 h-3 rounded-full bg-destructive/80" />
           <div className="w-3 h-3 rounded-full bg-accent/80" />
           <div className="w-3 h-3 rounded-full bg-success/80" />
        </div>
        <div className="w-full flex-1 border border-border/50 rounded-2xl bg-background/50 flex flex-col p-6 gap-4 shadow-inner">
           {/* Fake UI bars for aesthetic */}
           <div className="w-1/3 h-6 rounded-full bg-border/50 animate-pulse" />
           <div className="w-full h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col justify-center px-4">
             <div className="w-1/2 h-3 rounded-full bg-primary/30" />
           </div>
           <div className="w-full h-12 rounded-xl bg-accent/10 border border-accent/20 flex flex-col justify-center px-4">
             <div className="w-1/2 h-3 rounded-full bg-accent/30" />
           </div>
        </div>
      </motion.div>
    </div>
  )
}
