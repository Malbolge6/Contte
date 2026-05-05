'use client'

import { useState } from 'react'
import { LockScreen } from './LockScreen'

export function LockScreenWrapper({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false)

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />
  }

  return <>{children}</>
}
