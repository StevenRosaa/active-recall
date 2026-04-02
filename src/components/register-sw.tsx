'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(console.error)
      } else {
        // KILL-SWITCH: Rimuove i SW zombie in fase di sviluppo
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister()
          }
        })
      }
    }
  }, [])
  return null
}
