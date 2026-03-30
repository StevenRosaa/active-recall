'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from 'react'
import { updateProfile, updateEmail, updatePassword, deactivateAccount, deleteAccount } from '@/app/actions/profile'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Sliders, Palette, Mail, Lock, ShieldAlert, AlertTriangle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'

type Tab = 'profile' | 'preferences' | 'appearance'

export default function SettingsDialog({
  user, open, onClose
}: {
  user?: any; open: boolean; onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const { theme, setTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: '', last_name: '', birth_date: '', username: ''
  })
  const [initialProfileData, setInitialProfileData] = useState(profileData)

  const [emailFormOpen, setEmailFormOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  const [passwordFormOpen, setPasswordFormOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteUsername, setDeleteUsername] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user && open) {
      const initData = {
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        birth_date: user.user_metadata?.birth_date || '',
        username: user.user_metadata?.username || ''
      }
      setProfileData(initData)
      setInitialProfileData(initData)
      
      // Reset forms
      setEmailFormOpen(false)
      setPasswordFormOpen(false)
      setDeleteConfirmOpen(false)
      setNewEmail('')
      setNewPassword('')
      setDeleteUsername('')
    }
  }, [user, open])

  if (!mounted) return null

  const isProfileDirty = JSON.stringify(profileData) !== JSON.stringify(initialProfileData)

  const passwordUpdatedAt = user?.user_metadata?.password_updated_at
  const formattedPasswordDate = passwordUpdatedAt 
    ? format(parseISO(passwordUpdatedAt), "d MMM yyyy 'alle' HH:mm", { locale: it })
    : "mai"

  const handleSaveProfile = () => {
    startTransition(async () => {
      const res = await updateProfile(profileData)
      if (res.success) {
        setInitialProfileData(profileData)
      } else {
        alert(res.error)
      }
    })
  }

  const handleUpdateEmail = () => {
    startTransition(async () => {
      const res = await updateEmail(newEmail)
      if (res.success) {
        alert("Controlla la tua email per confermare l'aggiornamento.")
        setEmailFormOpen(false)
        setNewEmail('')
      } else {
        alert(res.error)
      }
    })
  }

  const handleUpdatePassword = () => {
    startTransition(async () => {
      const res = await updatePassword(newPassword)
      if (res.success) {
        alert("Password aggiornata con successo. Le altre sessioni sono state chiuse.")
        setPasswordFormOpen(false)
        setNewPassword('')
      } else {
        alert(res.error)
      }
    })
  }

  const handleDeactivate = () => {
    if (confirm("Sei sicuro di voler disattivare temporaneamente il tuo account?")) {
      startTransition(async () => {
        await deactivateAccount()
        // redirect handled natively or by reload
      })
    }
  }

  const handleDeleteAccount = () => {
    if (deleteUsername !== profileData.username) return
    startTransition(async () => {
      const res = await deleteAccount()
      if (res.error) {
        alert(res.error)
      }
    })
  }

  const layoutDuration = 0.4;
  const exitDuration = 0.15;
  const springConfig = { type: "spring" as const, bounce: 0.15, duration: layoutDuration }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="flex flex-col gap-6 pb-24 h-full overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Profilo</h3>
            
            <div className="flex flex-col gap-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <Button variant="outline" className="border-border bg-card/50 hover:bg-accent hover:text-accent-foreground text-foreground">
                  Cambia Foto
                </Button>
              </div>

              {/* Personal Info Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">Nome</Label>
                  <Input value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">Cognome</Label>
                  <Input value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">Username</Label>
                  <Input value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-foreground" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground">Data di Nascita</Label>
                  <Input type="date" value={profileData.birth_date} onChange={e => setProfileData({...profileData, birth_date: e.target.value})} className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 text-foreground [&::-webkit-calendar-picker-indicator]:dark:invert" />
                </div>
              </div>

              <div className="h-px bg-border/50 my-2" />

              {/* Security */}
              <h4 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Sicurezza
              </h4>
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl border border-border bg-card/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">Email Associata</span>
                      <span className="text-sm text-muted-foreground">{user?.email}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEmailFormOpen(!emailFormOpen)} className="h-9">Modifica Email</Button>
                  </div>
                  
                  <AnimatePresence>
                    {emailFormOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-2 flex flex-col gap-2">
                          <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Nuova email" className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11" />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setEmailFormOpen(false)}>Annulla</Button>
                            <Button size="sm" disabled={!newEmail || isPending} onClick={handleUpdateEmail}>Aggiorna</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">Password</span>
                      <span className="text-sm text-muted-foreground">Ultimo aggiornamento: {formattedPasswordDate}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPasswordFormOpen(!passwordFormOpen)} className="h-9">Modifica Password</Button>
                  </div>

                  <AnimatePresence>
                    {passwordFormOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-2 flex flex-col gap-2">
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nuova password sicura" className="bg-background/50 border-border focus-visible:ring-primary rounded-xl h-11 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setPasswordFormOpen(false)}>Annulla</Button>
                            <Button size="sm" disabled={!newPassword || isPending} onClick={handleUpdatePassword}>Aggiorna Password</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="h-px bg-border/50 my-2" />

              {/* Danger Zone */}
              <h4 className="text-lg font-bold text-destructive tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Danger Zone
              </h4>
              <div className="p-5 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Disattiva Account</span>
                    <span className="text-sm text-muted-foreground">Sospende temporaneamente il tuo profilo. Potrai riattivarlo facendo login.</span>
                  </div>
                  <Button variant="outline" disabled={isPending} onClick={handleDeactivate} className="border-border hover:bg-accent text-foreground shrink-0 rounded-xl">Disattiva temporaneamente</Button>
                </div>

                <div className="h-px bg-destructive/10" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex flex-col pb-2">
                    <span className="font-semibold text-destructive">Elimina Account Definitivamente</span>
                    <span className="text-sm text-muted-foreground">Attenzione: l'eliminazione è irreversibile e rimuoverà immediatamente tutti i tuoi dati.</span>
                    
                    <AnimatePresence>
                      {deleteConfirmOpen && (
                        <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="overflow-hidden flex flex-col gap-2">
                          <Label className="text-destructive text-xs font-semibold">Digita <span className="underline">{profileData.username}</span> per confermare</Label>
                          <Input value={deleteUsername} onChange={e => setDeleteUsername(e.target.value)} className="bg-destructive/10 border-destructive focus-visible:ring-destructive rounded-xl h-11 text-foreground" />
                          <div className="flex gap-2 mt-1">
                            <Button variant="ghost" size="sm" onClick={() => { setDeleteConfirmOpen(false); setDeleteUsername(''); }}>Annulla</Button>
                            <Button variant="destructive" size="sm" disabled={deleteUsername !== profileData.username || isPending} onClick={handleDeleteAccount} className="font-bold">
                              Conferma Eliminazione
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {!deleteConfirmOpen && (
                    <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)} className="shrink-0 rounded-xl font-bold">Elimina Account</Button>
                  )}
                </div>
              </div>

            </div>

            {/* Floating Action Bar */}
            <AnimatePresence>
              {isProfileDirty && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: 50, opacity: 0 }} 
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-popover/95 border border-border shadow-2xl shadow-black/40 backdrop-blur flex items-center justify-between z-50 text-popover-foreground"
                >
                  <span className="text-sm font-semibold ml-2">Modifiche non salvate</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" disabled={isPending} onClick={() => setProfileData(initialProfileData)} className="rounded-xl">Annulla</Button>
                    <Button onClick={handleSaveProfile} disabled={isPending} className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      {isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      case 'preferences':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="p-8 rounded-[2rem] border border-border bg-card/30 flex flex-col items-center justify-center text-center max-w-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-6 relative z-10 shadow-xl shadow-black/20">
                <Sliders className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-2xl font-black text-foreground mb-2 relative z-10">Preferenze Studio</h4>
              <p className="text-sm text-muted-foreground font-medium mb-6 relative z-10">
                L'algoritmo di iterazione spaziata customizzabile arriverà a breve per tutti gli utenti pro.
              </p>
              <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest relative z-10">
                Coming Soon
              </div>
            </div>
          </div>
        )
      case 'appearance':
        return (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Aspetto</h3>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">Tema Applicazione</span>
                  <span className="text-xs text-muted-foreground">Seleziona la modalità di visualizzazione</span>
                </div>
                <Switch 
                  withThemeIcon 
                  checked={theme === 'dark'} 
                  onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} 
                />
              </div>
            </div>
          </div>
        )
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: exitDuration, duration: exitDuration } }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            layout
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15, transition: { delay: exitDuration, duration: exitDuration } }}
            transition={{ layout: springConfig, default: { duration: layoutDuration } }}
            className="rounded-[2rem] relative z-10 w-[95vw] max-w-[900px] h-[85vh] max-h-[700px] md:h-[650px] border border-border bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col md:flex-row"
          >
            {/* Sidebar (25% logico, ma dimensionato staticamente on tailwind flex) */}
            <div className="w-full md:w-64 bg-card/30 border-b md:border-b-0 md:border-r border-border p-4 md:p-6 flex flex-col gap-2 shrink-0">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-2">Impostazioni</h2>
              
              <Button 
                variant={activeTab === 'profile' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('profile')}
                className={`w-full justify-start h-10 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
              >
                <User className="w-4 h-4 mr-2" /> Profilo
              </Button>
              <Button 
                variant={activeTab === 'preferences' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('preferences')}
                className={`w-full justify-start h-10 rounded-xl font-medium transition-colors ${activeTab === 'preferences' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
              >
                <Sliders className="w-4 h-4 mr-2" /> Preferenze
              </Button>
              <Button 
                variant={activeTab === 'appearance' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('appearance')}
                className={`w-full justify-start h-10 rounded-xl font-medium transition-colors ${activeTab === 'appearance' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
              >
                <Palette className="w-4 h-4 mr-2" /> Aspetto
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 relative flex flex-col">
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent p-2 rounded-full z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full h-full relative mt-8 md:mt-0 flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      filter: 'blur(0px)',
                      transition: { ...springConfig, delay: exitDuration } 
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.95, 
                      filter: 'blur(8px)',
                      transition: { duration: exitDuration, ease: "easeIn" }
                    }}
                    className="w-full h-full flex flex-col origin-center overflow-y-auto custom-scrollbar"
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
