'use client'

import { useFocusMode } from './focus-mode-context'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

export function NavBarWrapper({ children }: { children: React.ReactNode }) {
  const { isFocusModeActive } = useFocusMode()

  return (
    <AnimatePresence mode="wait">
      {!isFocusModeActive && (
        <motion.div
          key="navbar"
          initial={{ opacity: 0, scale: 0.6, y: -40, filter: 'blur(12px)' }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            scale: 0.4,
            y: -60,
            filter: 'blur(16px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            mass: 0.8,
          }}
          className="w-full origin-top"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
