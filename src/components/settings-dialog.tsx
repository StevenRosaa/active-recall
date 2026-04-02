'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from 'react'
import { updateProfile, updateEmail, updatePassword, deactivateAccount, deleteAccount } from '@/app/actions/profile'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Sliders, Palette, Mail, Lock, ShieldAlert, AlertTriangle, AlertCircle, Eye, EyeOff, Trash2, Bell, BellOff } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getRecallProfiles, addRecallProfile, deleteRecallProfile } from '@/app/actions/preferences'
import { RecallProfile } from '@/types'
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

  // Preferences State
  const [profiles, setProfiles] = useState<RecallProfile[]>([])
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileIntervals, setNewProfileIntervals] = useState('')
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)

  // Notifications State
  const [pushSupported, setPushSupported] = useState(false)
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

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

  // Preferences Logic
  useEffect(() => {
    if (activeTab === 'preferences' && open) {
      setIsLoadingProfiles(true)
      getRecallProfiles().then(data => {
        setProfiles(data)
        setIsLoadingProfiles(false)
      })
    }
  }, [activeTab, open])

  if (!mounted) return null

  // Check push support and existing subscription
  const checkPushStatus = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    setPushSupported(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setPushSubscribed(!!sub)
    } catch { /* ignore */ }
  }
  // Run once on mount via effect already handled by mounted state
  if (pushSupported === false && typeof window !== 'undefined' && 'PushManager' in window) {
    checkPushStatus()
  }

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

  const handleAddProfile = () => {
    if (!newProfileName || !newProfileIntervals) return
    const intervalsArray = newProfileIntervals.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
    if (intervalsArray.length === 0) return
    
    startTransition(async () => {
      try {
        await addRecallProfile(newProfileName, intervalsArray)
        const data = await getRecallProfiles()
        setProfiles(data)
        setNewProfileName('')
        setNewProfileIntervals('')
      } catch (e) {
        console.error(e)
      }
    })
  }

  const handleDeleteProfile = (id: string) => {
    startTransition(async () => {
      try {
        await deleteRecallProfile(id)
        setProfiles(prev => prev.filter(p => p.id !== id))
      } catch(e) { console.error(e) }
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

  function urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
  }

  const handleSubscribePush = async () => {
    setPushLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Permesso notifiche negato. Abilitalo dalle impostazioni del browser.')
        setPushLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setPushSubscribed(true)
    } catch (err) {
      console.error('Push subscribe error:', err)
      alert('Errore durante la registrazione delle notifiche.')
    }
    setPushLoading(false)
  }

  const handleUnsubscribePush = async () => {
    setPushLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      setPushSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    }
    setPushLoading(false)
  }

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground">Email Associata</span>
                      <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEmailFormOpen(!emailFormOpen)} className="h-9 shrink-0 w-full sm:w-auto">Modifica Email</Button>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground">Password</span>
                      <span className="text-sm text-muted-foreground truncate">Ultimo aggiornamento: {formattedPasswordDate}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPasswordFormOpen(!passwordFormOpen)} className="h-9 shrink-0 w-full sm:w-auto">Modifica Password</Button>
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

              {/* Notifications */}
              {pushSupported && (
                <>
                  <h4 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" /> Notifiche Push
                  </h4>
                  <div className="p-4 rounded-xl border border-border bg-card/30 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {pushSubscribed ? 'Notifiche Attive' : 'Notifiche Disattivate'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {pushSubscribed
                          ? 'Riceverai promemoria per le sessioni di ripetizione programmate.'
                          : 'Attiva le notifiche per ricevere promemoria giornalieri.'}
                      </span>
                    </div>
                    <Button
                      variant={pushSubscribed ? 'outline' : 'default'}
                      size="sm"
                      disabled={pushLoading}
                      onClick={pushSubscribed ? handleUnsubscribePush : handleSubscribePush}
                      className={`shrink-0 rounded-xl gap-2 ${pushSubscribed ? '' : 'bg-primary hover:bg-primary/90 shadow-[0_0_12px_rgba(168,85,247,0.3)]'}`}
                    >
                      {pushSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      {pushLoading ? 'Caricamento...' : pushSubscribed ? 'Disattiva' : 'Attiva'}
                    </Button>
                  </div>
                  <div className="h-px bg-border/50 my-2" />
                </>
              )}

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
                    <Button variant="ghost" disabled={isPending} onClick={() => setProfileData(initialProfileData)} className="rounded-xl transition-all active:scale-95">Annulla</Button>
                    <Button onClick={handleSaveProfile} disabled={isPending} className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all active:scale-95">
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
          <div className="flex flex-col gap-6 w-full max-w-full mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-primary" /> Profili Ripetizione Spaziata
            </h3>
            
            <div className="flex flex-col gap-4 pb-12">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-2">Crea Nuovo Profilo</h4>
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Nome Profilo</Label>
                    <Input value={newProfileName} onChange={e => setNewProfileName(e.target.value)} placeholder="es. Lungo Termine" className="bg-background/50 border-border" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Intervalli (giorni, separati da virgola)</Label>
                    <Input value={newProfileIntervals} onChange={e => setNewProfileIntervals(e.target.value)} placeholder="es. 1, 7, 30, 90" className="bg-background/50 border-border" />
                  </div>
                </div>
                <Button onClick={handleAddProfile} disabled={isPending || !newProfileName || !newProfileIntervals} className="w-full sm:w-auto self-end mt-2 transition-all active:scale-95">
                  Aggiungi Profilo
                </Button>
              </div>

              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-6">I Tuoi Profili</h4>
              <div className="flex flex-col gap-3">
                {isLoadingProfiles ? (
                  <p className="text-sm text-muted-foreground animate-pulse text-center py-4">Caricamento profili in corso...</p>
                ) : profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nessun profilo personalizzato creato.</p>
                ) : (
                  profiles.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors group">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-foreground">{p.name}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.intervals.map((interval, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs font-semibold shadow-sm">
                              +{interval}g
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProfile(p.id)} disabled={isPending} className="self-end sm:self-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all active:scale-90 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
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
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-card/30 border-b md:border-b-0 md:border-r border-border p-3 sm:p-4 md:p-6 flex flex-col gap-2 shrink-0">
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
            <div className="flex-1 p-4 sm:p-6 md:p-10 relative flex flex-col overflow-x-hidden">
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-muted-foreground hover:text-foreground transition-all active:scale-90 hover:bg-accent p-2 rounded-full z-20"
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
                    className="w-full max-w-full h-full flex flex-col origin-center overflow-x-hidden overflow-y-auto custom-scrollbar"
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
