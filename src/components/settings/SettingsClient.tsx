'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Sun, Moon, Palette, Shield, 
  Smartphone, Bell, Lock, LogOut, 
  Check, ChevronRight, User, Sparkles
} from 'lucide-react'

export function SettingsClient() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px' }}>Ajustes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Controle total sobre sua experiência Contte.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Theme Selection */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={18} color="#ccff00" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Visual da Plataforma</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { id: 'ORIGINAL', label: 'Contte', color: '#ccff00', bg: '#0a0a0a', border: '#ccff00' },
              { id: 'DARK', label: 'Dark Mode', color: '#3b82f6', bg: '#000000', border: '#3b82f6' },
              { id: 'LIGHT', label: 'Light', color: '#0f172a', bg: '#ffffff', border: '#0f172a' },
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                style={{
                  padding: '20px 12px', borderRadius: '24px', border: '2px solid',
                  borderColor: theme === t.id ? t.border : 'rgba(255,255,255,0.05)',
                  background: t.bg, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                  boxShadow: theme === t.id ? `0 10px 30px ${t.border}20` : 'none',
                  transform: theme === t.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: t.color, display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', border: '3px solid rgba(255,255,255,0.1)' 
                }}>
                  {theme === t.id && <Check size={16} color={t.id === 'LIGHT' ? '#fff' : '#000'} strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: t.id === 'LIGHT' ? '#000' : '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Security & Preferences */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Preferências</h2>
          </div>

          {[
            { icon: Bell, label: 'Notificações Push', desc: 'Alertas críticos no celular', action: () => setNotifications(!notifications), active: notifications, color: '#f43f5e' },
            { icon: Lock, label: 'Segurança', desc: 'Gerenciar senha e sessões', action: () => {}, active: null, color: '#a855f7' },
            { icon: Smartphone, label: 'Modo Aplicativo', desc: 'Instalar na tela de início', action: () => {}, active: null, color: '#34d399' },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={item.action}
              style={{ 
                padding: '20px', background: 'var(--card-bg)', 
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={22} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.desc}</p>
                </div>
              </div>
              {item.active !== null ? (
                <div style={{ 
                  width: '52px', height: '28px', borderRadius: '20px', 
                  background: item.active ? '#ccff00' : 'rgba(255,255,255,0.1)', 
                  position: 'relative', transition: 'all 0.3s' 
                }}>
                  <div style={{ 
                    width: '22px', height: '22px', borderRadius: '50%', 
                    background: item.active ? '#000' : '#71717a', 
                    position: 'absolute', top: '3px', 
                    left: item.active ? '27px' : '3px', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }} />
                </div>
              ) : (
                <ChevronRight size={20} color="var(--text-muted)" />
              )}
            </div>
          ))}
        </section>

        <button 
          onClick={() => window.location.href = '/api/auth/signout'}
          style={{ 
            marginTop: '12px', padding: '20px', borderRadius: '24px', 
            background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', 
            border: '1px solid rgba(239, 68, 68, 0.15)', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
        >
          <LogOut size={22} />
          Encerrar Sessão
        </button>
      </div>
    </div>
  )
}
