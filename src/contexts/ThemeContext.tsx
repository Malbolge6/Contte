'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'DARK' | 'LIGHT' | 'ORIGINAL'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('ORIGINAL')

  useEffect(() => {
    const saved = localStorage.getItem('contte-theme') as Theme
    if (saved) setThemeState(saved)
  }, [])

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
    } else if (newTheme === 'DARK') {
      root.style.setProperty('--bg-main', '#000000')
      root.style.setProperty('--accent', '#3b82f6')
      root.style.setProperty('--card-bg', '#111111')
      root.style.setProperty('--text-main', '#ffffff')
      root.style.setProperty('--text-muted', '#94a3b8')
    } else {
      root.style.setProperty('--bg-main', '#f8fafc')
      root.style.setProperty('--accent', '#0f172a')
      root.style.setProperty('--card-bg', '#ffffff')
      root.style.setProperty('--text-main', '#0f172a')
      root.style.setProperty('--text-muted', '#64748b')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-${theme.toLowerCase()}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
