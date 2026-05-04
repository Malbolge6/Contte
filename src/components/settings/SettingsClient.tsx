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
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>Configurações</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Personalize sua experiência no Contte.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Theme Selection */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Palette size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Aparência</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { id: 'ORIGINAL', label: 'Contte', color: '#ccff00', bg: '#0a0a0a' },
              { id: 'DARK', label: 'Dark', color: '#3b82f6', bg: '#000000' },
              { id: 'LIGHT', label: 'Light', color: '#0f172a', bg: '#ffffff' },
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                style={{
                  padding: '16px', borderRadius: '20px', border: '2px solid',
                  borderColor: theme === t.id ? 'var(--accent)' : 'transparent',
                  background: t.bg, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme === t.id && <Check size={14} color={t.id === 'LIGHT' ? '#fff' : '#000'} />}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: t.id === 'LIGHT' ? '#000' : '#fff' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Account Settings */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <User size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Conta</h2>
          </div>

          {[
            { icon: Bell, label: 'Notificações', desc: 'Alertas de contas e feed', action: () => setNotifications(!notifications), active: notifications },
            { icon: Shield, label: 'Privacidade', desc: 'Dados e segurança', action: () => {}, active: null },
            { icon: Smartphone, label: 'Instalar App', desc: 'Adicionar à tela de início', action: () => {}, active: null },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={item.action}
              style={{ 
                padding: '16px 20px', background: 'var(--card-bg)', 
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} color="var(--text-muted)" />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
              {item.active !== null ? (
                <div style={{ width: '44px', height: '24px', borderRadius: '20px', background: item.active ? 'var(--accent)' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.3s' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: item.active ? '23px' : '3px', transition: 'all 0.3s' }} />
                </div>
              ) : (
                <ChevronRight size={18} color="var(--text-muted)" />
              )}
            </div>
          ))}
        </section>

        <button style={{ 
          marginTop: '20px', padding: '18px', borderRadius: '20px', 
          background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', 
          border: 'none', fontWeight: 800, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  )
}
