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

  useEffect(() => {
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

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 16px 12px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px', height: '36px',
              background: '#ccff00',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#050505', fontSize: '22px', fontWeight: 900, fontFamily: 'system-ui, sans-serif' }}>
              C
            </span>
          </div>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.5px' }}>
          contte
        </span>
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <Link
          href="/alertas"
          style={{
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            textDecoration: 'none', color: '#a0a0b0',
            transition: 'all 0.2s',
          }}
        >
          <Bell size={18} />
        </Link>

        {/* Install App Button — only shows when app is installable */}
        {installPrompt && !isInstalled && (
          <button
            onClick={handleInstall}
            title="Instalar App"
            style={{
              height: '38px',
              paddingLeft: '12px', paddingRight: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              borderRadius: '10px',
              background: '#ccff00',
              border: 'none',
              cursor: 'pointer',
              color: '#050505',
              fontWeight: 700,
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={14} />
            Instalar
          </button>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '10px',
            background: 'rgba(204, 255, 0, 0.1)',
            border: '1px solid rgba(204, 255, 0, 0.2)',
            cursor: 'pointer',
            color: '#ccff00',
          }}
        >
          <User size={18} />
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
