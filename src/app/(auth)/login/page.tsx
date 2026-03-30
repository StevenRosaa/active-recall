'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup, signInWithOAuth } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, ArrowLeft, User, Calendar, AtSign } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const AppleIcon = () => (
  <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.31-.86 3.73-.8 1.58.11 2.81.76 3.58 1.94-3.07 1.84-2.58 5.86.35 7.15-.69 1.63-1.57 3.06-2.74 3.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.33 2.33-1.89 4.31-3.74 4.25z" />
  </svg>
)

function AuthForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [isLogin, setIsLogin] = useState(true)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1)
  
  // State for preserving form data during AnimatePresence unmounts
  const [regData, setRegData] = useState({
    email: '', password: '', firstName: '', lastName: '', birthDate: '', username: ''
  })

  // Molla configurata per un Flip 3D elegante e bilanciato
  const springConfig = { type: "spring" as const, stiffness: 120, damping: 20 }

  return (
    <div className="w-full max-w-md relative z-10" style={{ perspective: "1200px" }}>

      <motion.div
        initial={false}
        // Il contenitore intero ruota sull'asse Y
        animate={{ rotateY: isLogin ? 0 : 180 }}
        transition={springConfig}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full relative"
      >

        {/* ======================= */}
        {/* FACCIATA 1: LOGIN (FRONT) */}
        {/* ======================= */}
        <div
          className="w-full rounded-[2rem] p-6 md:p-10 border border-border bg-background/95 shadow-2xl shadow-black/40 flex flex-col relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: isLogin ? "auto" : "none"
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Bentornato</h1>
            <p className="text-muted-foreground text-sm font-medium">Accedi per continuare a studiare.</p>
          </div>

          <div className="min-h-[48px] mb-2 flex items-end justify-center">
            {error && (
              <div className="w-full p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <Button variant="outline" onClick={() => signInWithOAuth('google')} className="w-full h-12 bg-card/50 hover:bg-accent border-border text-foreground hover:text-accent-foreground rounded-xl transition-transform active:scale-95">
              <GoogleIcon /> Accedi con Google
            </Button>
            <Button variant="outline" onClick={() => signInWithOAuth('apple')} className="w-full h-12 bg-card/50 hover:bg-accent border-border text-foreground hover:text-accent-foreground rounded-xl transition-transform active:scale-95">
              <AppleIcon /> Accedi con Apple
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Oppure</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email-login" className="text-xs text-muted-foreground ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email-login" name="email" type="email" placeholder="nome@esempio.com" required className="pl-11 bg-card/50 border-border focus-visible:ring-primary rounded-xl h-12 text-sm text-foreground" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password-login" className="text-xs text-muted-foreground ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password-login" name="password" type="password" placeholder="••••••••" required className="pl-11 bg-card/50 border-border focus-visible:ring-primary rounded-xl h-12 text-sm text-foreground" />
              </div>
            </div>

            <Button type="submit" formAction={login} className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform active:scale-95 group flex items-center justify-center gap-2">
              Accedi
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button type="button" onClick={() => setIsLogin(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Non hai un account? <span className="text-primary font-semibold underline underline-offset-4 decoration-primary/30 hover:decoration-primary">Registrati</span>
            </button>
          </div>
        </div>

        {/* ========================== */}
        {/* FACCIATA 2: REGISTER (BACK) */}
        {/* ========================== */}
        <div
          className="absolute top-0 left-0 w-full h-full rounded-[2rem] p-6 md:p-10 border border-border bg-background/95 shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            pointerEvents: !isLogin ? "auto" : "none"
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Nuovo Account</h1>
            <p className="text-muted-foreground text-sm font-medium">Inizia a organizzare il tuo studio.</p>
          </div>

          <div className="min-h-[48px] mb-2 flex items-end justify-center">
            {error && (
              <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <Button variant="outline" onClick={() => signInWithOAuth('google')} className="w-full h-12 bg-card/50 hover:bg-accent border-border text-foreground hover:text-accent-foreground rounded-xl transition-transform active:scale-95">
              <GoogleIcon /> Registrati con Google
            </Button>
            <Button variant="outline" onClick={() => signInWithOAuth('apple')} className="w-full h-12 bg-card/50 hover:bg-accent border-border text-foreground hover:text-accent-foreground rounded-xl transition-transform active:scale-95">
              <AppleIcon /> Registrati con Apple
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Oppure</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form className="flex flex-col gap-4 w-full" action={signup}>
            <AnimatePresence mode="popLayout" initial={false}>
              {registerStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email-register" className="text-xs text-muted-foreground ml-1">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email-register" name="email" type="email" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} placeholder="nome@esempio.com" required className="pl-11 bg-card/50 border-border focus-visible:ring-primary rounded-xl h-12 text-sm text-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password-register" className="text-xs text-muted-foreground ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="password-register" name="password" type="password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} placeholder="••••••••" required className="pl-11 bg-card/50 border-border focus-visible:ring-primary rounded-xl h-12 text-sm text-foreground" />
                    </div>
                  </div>

                  <Button type="button" onClick={() => setRegisterStep(2)} disabled={!regData.email || !regData.password} className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform active:scale-95 group flex items-center justify-center gap-2">
                    Avanti
                    <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {registerStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="w-full flex flex-col gap-4"
                >
                  {/* Hidden inputs to pass data from step 1 */}
                  <input type="hidden" name="email" value={regData.email} />
                  <input type="hidden" name="password" value={regData.password} />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="first_name" className="text-xs text-muted-foreground ml-1">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="first_name" name="first_name" value={regData.firstName} onChange={(e) => setRegData({...regData, firstName: e.target.value})} placeholder="Mario" required className="pl-9 bg-card/50 border-border rounded-xl h-11 text-sm text-foreground" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="last_name" className="text-xs text-muted-foreground ml-1">Cognome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="last_name" name="last_name" value={regData.lastName} onChange={(e) => setRegData({...regData, lastName: e.target.value})} placeholder="Rossi" required className="pl-9 bg-card/50 border-border rounded-xl h-11 text-sm text-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="username" className="text-xs text-muted-foreground ml-1">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="username" name="username" value={regData.username} onChange={(e) => setRegData({...regData, username: e.target.value})} placeholder="mariorossi99" required className="pl-11 bg-card/50 border-border rounded-xl h-11 text-sm text-foreground" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="birth_date" className="text-xs text-muted-foreground ml-1">Data di Nascita</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="birth_date" name="birth_date" type="date" value={regData.birthDate} onChange={(e) => setRegData({...regData, birthDate: e.target.value})} required className="pl-11 bg-card/50 border-border rounded-xl h-11 text-sm text-foreground [&::-webkit-calendar-picker-indicator]:dark:invert" />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button type="button" variant="outline" onClick={() => setRegisterStep(1)} className="w-12 shrink-0 h-12 rounded-xl bg-card/50 border-border text-foreground hover:bg-accent transition-transform active:scale-95 flex items-center justify-center p-0">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button type="submit" disabled={!regData.firstName || !regData.lastName || !regData.username || !regData.birthDate} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-transform active:scale-95 group flex items-center justify-center gap-2">
                      Crea Account
                      <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-8 text-center">
            <button type="button" onClick={() => setIsLogin(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Hai già un account? <span className="text-primary font-semibold underline underline-offset-4 decoration-primary/30 hover:decoration-primary">Accedi</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Manteniamo i globi luminosi sullo sfondo della pagina per l'effetto wow! */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-50 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-50" />

      <div className="absolute inset-0 bg-black/5 dark:bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,transparent)] dark:[mask-image:linear-gradient(180deg,white,transparent)] opacity-20 pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md h-[600px] rounded-[2rem] border border-border bg-background/80 animate-pulse" />
      }>
        <AuthForm />
      </Suspense>
    </div>
  )
}