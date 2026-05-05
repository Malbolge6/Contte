'use client'

import { signOut } from 'next-auth/react'
import { Bell, LogOut, User, Download } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function TopBar({ user }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') {
      setInstallPrompt(null)
      setIsInstalled(true)
    }
  }

  if (!mounted) return null

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '24px', fontWeight: 900, color: '#ccff00', letterSpacing: '-1px' }}>
          CONTTE
        </span>
      </div>

      {/* Right side Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '6px 6px 6px 12px',
            borderRadius: '30px',
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Bell size={16} color="#a1a1aa" />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', background: '#f43f5e', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
              {user.name?.split(' ')[0] || 'Usuário'}
            </span>
            <span style={{ fontSize: '10px', color: '#71717a', lineHeight: 1, marginTop: '2px' }}>
              @contte
            </span>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ccff00', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginLeft: '4px' }}>
            {user.image ? (
              <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={16} color="#000" />
            )}
          </div>
        </button>

        {showMenu && (
          <div
            style={{
              position: 'absolute',
              top: '46px', right: 0,
              background: '#16161f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '8px',
              minWidth: '200px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              zIndex: 100,
            }}
          >
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8f9fa' }}>
                {user.name || 'Usuário'}
              </p>
              <p style={{ fontSize: '12px', color: '#6b6b80', marginTop: '2px' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#f87171', fontSize: '14px', fontWeight: 500,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          </div>
        )}
      </div>

      {/* Close menu on backdrop click */}
      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 39 }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  )
}
