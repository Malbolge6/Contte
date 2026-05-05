'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Sun, Moon, Palette, Shield, 
  Smartphone, Bell, Lock, LogOut, 
  Check, ChevronRight, User, Sparkles, CreditCard, ExternalLink, Loader2, XCircle, Clock
} from 'lucide-react'
import { cancelSubscription } from '@/actions/subscriptions'
import { updateHourlyRate } from '@/actions/user'

export function SettingsClient({ currentPlan, initialHourlyRate }: { currentPlan: string, initialHourlyRate: number }) {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [hourlyRate, setHourlyRate] = useState(initialHourlyRate)
  const [savingRate, setSavingRate] = useState(false)

  async function handleManageSubscription() {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar o portal de assinatura.')
    } finally {
      setLoadingPortal(false)
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará sendo Premium até o fim do período atual.')) {
      return
    }

    setLoadingCancel(true)
    try {
      const res = await cancelSubscription()
      if (res.success) {
        alert('Assinatura cancelada! Você terá acesso até o fim do período pago.')
        window.location.reload()
      } else {
        alert('Erro ao cancelar: ' + res.error)
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao processar o cancelamento.')
    } finally {
      setLoadingCancel(false)
    }
  }

  async function handleSaveHourlyRate() {
    setSavingRate(true)
    try {
      const res = await updateHourlyRate(hourlyRate)
      if (res.success) {
        alert('Valor da hora atualizado com sucesso!')
      } else {
        alert('Erro ao atualizar: ' + res.error)
      }
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar valor da hora.')
    } finally {
      setSavingRate(false)
    }
  }

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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { id: 'ORIGINAL', label: 'Contte (Dark)', color: '#ccff00', bg: '#0a0a0a', border: '#ccff00' },
              { id: 'LIGHT', label: 'Light Mode', color: '#0f172a', bg: '#ffffff', border: '#0f172a' },
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

        {/* Life Hours Calculator Settings */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} color="#ccff00" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Seu Valor-Hora</h2>
          </div>

          <div style={{ 
            padding: '24px', background: 'var(--card-bg)', 
            borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Quanto vale 1 hora do seu trabalho? Isso nos ajuda a calcular o "Custo de Vida" dos seus gastos.
            </p>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>R$</span>
              <input 
                type="number" 
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                style={{ 
                  width: '100%', padding: '16px 16px 16px 45px', borderRadius: '16px', 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '18px', fontWeight: 800, outline: 'none'
                }}
                placeholder="0,00"
              />
            </div>
            <button 
              onClick={handleSaveHourlyRate}
              disabled={savingRate}
              style={{ 
                width: '100%', padding: '14px', borderRadius: '16px', 
                background: '#ccff00', color: '#000', border: 'none', fontWeight: 800, 
                cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {savingRate ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Valor-Hora'}
            </button>
          </div>
        </section>

        {/* Subscription Management */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="#ccff00" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Minha Assinatura</h2>
          </div>

          <div style={{ 
            padding: '24px', background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1) 0%, rgba(204, 255, 0, 0.02) 100%)', 
            borderRadius: '28px', border: '1px solid rgba(204, 255, 0, 0.2)',
            display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#ccff00', background: 'rgba(204, 255, 0, 0.1)', padding: '4px 10px', borderRadius: '99px', textTransform: 'uppercase' }}>
                    {currentPlan === 'PREMIUM' ? 'Plano Premium' : 'Plano Gratuito'}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {currentPlan === 'PREMIUM' 
                    ? 'Você tem acesso total a todas as ferramentas do Contte.' 
                    : 'Aproveite os recursos básicos ou assine para liberar tudo.'}
                </p>
              </div>
              <Sparkles size={24} color="#ccff00" />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleManageSubscription}
                disabled={loadingPortal || currentPlan !== 'PREMIUM'}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', 
                  background: currentPlan === 'PREMIUM' ? '#fff' : 'rgba(255,255,255,0.05)', 
                  color: '#000', border: 'none', fontWeight: 800, cursor: currentPlan === 'PREMIUM' ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s', fontSize: '13px', opacity: currentPlan === 'PREMIUM' ? 1 : 0.5
                }}
              >
                {loadingPortal ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <CreditCard size={18} />
                    Cartão
                  </>
                )}
              </button>

              <button 
                onClick={handleCancelSubscription}
                disabled={loadingCancel || currentPlan !== 'PREMIUM'}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 800, cursor: currentPlan === 'PREMIUM' ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s', fontSize: '13px', opacity: currentPlan === 'PREMIUM' ? 1 : 0.5
                }}
              >
                {loadingCancel ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    <XCircle size={18} />
                    Cancelar
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>Notificações</h2>
          </div>

          <div 
            onClick={() => setNotifications(!notifications)}
            style={{ 
              padding: '20px', background: 'var(--card-bg)', 
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `rgba(244, 63, 94, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} color="#f43f5e" />
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Alertas Push</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Receber lembretes no celular</p>
              </div>
            </div>
            <div style={{ 
              width: '52px', height: '28px', borderRadius: '20px', 
              background: notifications ? '#ccff00' : 'rgba(255,255,255,0.1)', 
              position: 'relative', transition: 'all 0.3s' 
            }}>
              <div style={{ 
                width: '22px', height: '22px', borderRadius: '50%', 
                background: notifications ? '#000' : '#71717a', 
                position: 'absolute', top: '3px', 
                left: notifications ? '27px' : '3px', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }} />
            </div>
          </div>
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
