'use client'
import Link from 'next/link'
import { CalendarDays, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function NavLinks() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const links = [
    { name: 'Calendario', href: '/dashboard', icon: CalendarDays },
    { name: 'Statistiche', href: '/dashboard/analytics', icon: BarChart3 }
  ]

  return (
    <div className="flex items-center gap-1 bg-background/20 p-1 rounded-full border border-border/30 relative z-0">
      {links.map((link) => {
        const isActive = pathname === link.href
        const Icon = link.icon
        return (
          <Link key={link.href} href={link.href} prefetch={true} className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all active:scale-95 text-sm font-medium z-10 ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>
            {mounted && isActive && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-white/15 rounded-full -z-10" />
            )}
            <Icon className="h-4 w-4" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        )
      })}
    </div>
  )
}