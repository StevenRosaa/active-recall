'use client'

import React, { createContext, useContext, useState } from 'react'

interface FocusModeContextType {
  isFocusModeActive: boolean
  setIsFocusModeActive: (active: boolean) => void
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined)

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isFocusModeActive, setIsFocusModeActive] = useState(false)

  return (
    <FocusModeContext.Provider value={{ isFocusModeActive, setIsFocusModeActive }}>
      {children}
    </FocusModeContext.Provider>
  )
}

export function useFocusMode() {
  const context = useContext(FocusModeContext)
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider')
  }
  return context
}
