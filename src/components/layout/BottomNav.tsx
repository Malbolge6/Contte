'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, Wallet, CreditCard, Activity, FileText, Settings, Bot } from 'lucide-react'
import { useState, useEffect } from 'react'

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Início' },
    { href: '/agentes', icon: Bot, label: 'Inteligência' },
    { href: '/timeline', icon: Activity, label: 'Feed' },
    { href: '/transacoes', icon: Wallet, label: 'Extrato' },
    { href: '/assinaturas', icon: CreditCard, label: 'Assinaturas' },
    { href: '/contas', icon: FileText, label: 'Contas' },
    { href: '/metas', icon: Target, label: 'Metas' },
    { href: '/configuracoes', icon: Settings, label: 'Ajustes' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', 
      left: '50%', transform: 'translateX(-50%)',
      background: '#161618',
      borderRadius: '40px',
      padding: '8px 12px',
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px',
      zIndex: 50,
      boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
      width: 'max-content',
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              width: '48px', height: '48px', borderRadius: '24px',
              background: isActive ? '#ccff00' : 'transparent',
              color: isActive ? '#000' : '#52525b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
          >
            {isActive && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', background: '#ccff00', filter: 'blur(20px)', opacity: 0.2, borderRadius: '50%', zIndex: -1 }} />
            )}
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        )
      })}
    </nav>
  )
}
