'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import SettingsDialog from './settings-dialog'

export default function UserMenu({ 
  user, 
  signOutAction 
}: { 
  user: any; 
  signOutAction: () => Promise<void> 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-card/50 border border-border hover:border-border/80 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-lg shadow-black/20 text-foreground"
        >
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs md:text-sm font-bold">{initials}</span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
              <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
              className="absolute right-0 top-full mt-3 w-60 p-2 rounded-2xl border border-border bg-popover/95 backdrop-blur-2xl shadow-2xl shadow-black/40 z-50 origin-top-right flex flex-col font-medium text-popover-foreground"
            >
              <div className="px-3 py-2 mb-1 flex flex-col">
                <span className="text-sm font-semibold truncate">
                  {user?.user_metadata?.full_name || 'Utente'}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </span>
              </div>

              <div className="h-px bg-border/50 my-1 mx-2" />

              <button 
                onClick={() => { setIsOpen(false); setSettingsOpen(true) }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors text-sm text-left relative overflow-hidden group"
              >
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                Impostazioni
              </button>

              <div className="h-px bg-border/50 my-1 mx-2" />

              <div className="flex items-center justify-between p-2.5 rounded-xl text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer" onClick={(e) => {
                  e.stopPropagation()
                  setTheme(theme === 'dark' ? 'light' : 'dark')
              }}>
                <div className="flex items-center gap-3">
                  {mounted && theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Tema
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  {mounted && (
                    <Switch 
                      withThemeIcon 
                      checked={theme === 'dark'} 
                      onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} 
                      size="sm"
                    />
                  )}
                </div>
              </div>

              <div className="h-px bg-border/50 my-1 mx-2" />

              <button 
                onClick={() => { setIsOpen(false); signOutAction() }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-sm text-left group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SettingsDialog user={user} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
