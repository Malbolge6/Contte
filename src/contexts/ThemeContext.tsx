'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'DARK' | 'LIGHT' | 'ORIGINAL'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  privacyMode: boolean
  setPrivacyMode: (active: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('ORIGINAL')
  const [privacyMode, setPrivacyModeState] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('contte-theme') as Theme
    if (saved) setTheme(saved)
    
    const savedPrivacy = localStorage.getItem('contte-privacy') === 'true'
    setPrivacyModeState(savedPrivacy)
  }, [])

  const setPrivacyMode = (active: boolean) => {
    setPrivacyModeState(active)
    localStorage.setItem('contte-privacy', active ? 'true' : 'false')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('contte-theme', newTheme)
    
    // Apply CSS Variables
    const root = document.documentElement
    if (newTheme === 'ORIGINAL') {
      root.style.setProperty('--bg-main', '#0a0a0a')
      root.style.setProperty('--accent', '#ccff00')
      root.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.03)')
      root.style.setProperty('--text-main', '#ffffff')
      root.style.setProperty('--text-muted', '#71717a')
    } else if (newTheme === 'LIGHT') {
      root.style.setProperty('--bg-main', '#f8fafc')
      root.style.setProperty('--accent', '#0f172a')
      root.style.setProperty('--card-bg', '#ffffff')
      root.style.setProperty('--text-main', '#0f172a')
      root.style.setProperty('--text-muted', '#64748b')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, privacyMode, setPrivacyMode }}>
      <div className={`theme-${theme.toLowerCase()} ${privacyMode ? 'privacy-active' : ''}`}>
        {children}
        <style jsx global>{`
          .privacy-active .blur-amount {
            filter: blur(8px) !important;
            transition: filter 0.3s ease;
          }
          .blur-amount {
            transition: filter 0.3s ease;
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
