'use client'

import { useFocusMode } from './focus-mode-context'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

export function FooterWrapper({ children }: { children: React.ReactNode }) {
  const { isFocusModeActive } = useFocusMode()

  return (
    <AnimatePresence mode="wait">
      {!isFocusModeActive && (
        <motion.div
          key="footer"
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            y: 60,
            filter: 'blur(12px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 30,
            mass: 0.6,
          }}
          className="w-full origin-bottom relative z-40"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
