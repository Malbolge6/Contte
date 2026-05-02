'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Target, Wallet, AlertCircle, Folder } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Início' },
    { href: '/transacoes', icon: Wallet, label: 'Transação' },
    { href: '/contas', icon: FileText, label: 'Contas' },
    { href: '/documentos', icon: Folder, label: 'Grupos' },
    { href: '/metas', icon: Target, label: 'Metas' },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 16px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      zIndex: 50,
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              color: isActive ? '#ccff00' : '#71717a',
              textDecoration: 'none', transition: 'all 0.2s ease',
              width: '64px',
            }}
          >
            <div style={{
              padding: '8px 16px', borderRadius: '16px',
              background: isActive ? 'rgba(204, 255, 0, 0.1)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, opacity: isActive ? 1 : 0.8 }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
