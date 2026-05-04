'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  Target, Activity, Clock, DollarSign, 
  ShoppingBag, Utensils, Car, House, 
  Smartphone, Zap, Coffee, Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, ChevronRight, Shield
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface TimelineEvent {
  id: string
  type: string
  profileType?: string | null
  title: string
  description: string
  amount?: number | null
  category?: string | null
  createdAt: Date
}

function getEventIcon(type: string, profileType?: string | null) {
  if (type === 'admin') {
    if (profileType === 'FINANCE') return { icon: TrendingUp, color: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', label: 'Contte Finance' }
    if (profileType === 'NOTICIAS') return { icon: Sparkles, color: '#38bdf8', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', label: 'Contte Notícias' }
    return { icon: Shield, color: '#f87171', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', label: 'Contte Official' }
  }

  switch (type) {
    case 'expense': return { icon: ShoppingBag, color: '#f87171', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', label: 'Gasto' }
    case 'income': return { icon: DollarSign, color: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', label: 'Entrada' }
    case 'alert': return { icon: AlertCircle, color: '#facc15', gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)', label: 'Alerta' }
    case 'goal': return { icon: Target, color: '#c084fc', gradient: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', label: 'Meta' }
    case 'insight': return { icon: Activity, color: '#38bdf8', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', label: 'Insight' }
    default: return { icon: Clock, color: '#ccff00', gradient: 'linear-gradient(135deg, #a3e635 0%, #ccff00 100%)', label: 'Contte Intelligence' }
  }
}

export function TimelineClient({ initialEvents = [] }: TimelineClientProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filteredEvents = activeFilter 
    ? initialEvents.filter(e => {
        if (activeFilter === 'Meu Dia') return e.type === 'expense' || e.type === 'income'
        if (activeFilter === 'Dicas') return e.type === 'insight'
        if (activeFilter === 'Alertas') return e.type === 'alert'
        if (activeFilter === 'Metas') return e.type === 'goal'
        return true
      })
    : initialEvents

  return (
    <div className="fade-in" style={{ paddingTop: '12px', paddingBottom: '120px', maxWidth: '500px', margin: '0 auto' }}>
      {/* Stories Section */}
      <div style={{ marginBottom: '32px', overflowX: 'auto', display: 'flex', gap: '12px', padding: '0 4px', scrollbarWidth: 'none' }} className="no-scrollbar">
        {[
          { label: 'Tudo', icon: '📱', color: '#fff' },
          { label: 'Meu Dia', icon: '☀️', color: '#ccff00' },
          { label: 'Dicas', icon: '💡', color: '#38bdf8' },
          { label: 'Economia', icon: '💰', color: '#4ade80' },
          { label: 'Alertas', icon: '⚠️', color: '#facc15' },
          { label: 'Metas', icon: '🎯', color: '#c084fc' },
        ].map((story, i) => (
          <div 
            key={i} 
            onClick={() => setActiveFilter(story.label === 'Tudo' ? null : story.label)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}
          >
            <div style={{ 
              width: '68px', height: '68px', borderRadius: '50%', 
              padding: '3px', border: `2px solid ${activeFilter === story.label || (activeFilter === null && story.label === 'Tudo') ? story.color : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                background: 'rgba(255,255,255,0.05)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
              }}>
                {story.icon}
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: activeFilter === story.label ? '#fff' : '#a1a1aa' }}>{story.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px', padding: '0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
            Seu Feed
          </h1>
          <p style={{ color: '#71717a', fontSize: '13px', fontWeight: 500 }}>
            Vida financeira em tempo real
          </p>
        </div>
        <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} />
          Personalizado
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px' }}>
            <Activity size={48} color="#ccff00" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Nada por aqui ainda...
            </h3>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
              Tente mudar o filtro ou adicione novas movimentações.
            </p>
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const { icon: Icon, color, gradient, label: profileLabel } = getEventIcon(event.type, event.profileType)
            return (
              <div 
                key={event.id} 
                className="scale-in" 
                style={{ 
                  animationDelay: `${index * 0.08}s`,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '28px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  position: 'relative'
                }}
              >
                {/* User Info / Header */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: gradient, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}30`
                  }}>
                    <Icon size={18} color="#000" strokeWidth={2.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{profileLabel}</span>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={10} color="#fff" />
                      </div>
                      {event.type === 'admin' && (
                        <span style={{ fontSize: '9px', fontWeight: 900, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Oficial</span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#71717a' }}>@{event.type} • {new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', color: '#52525b' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Main Content Area */}
                <div style={{ padding: '0 20px 20px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: '1.4' }}>
                    {event.title}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#d4d4d8', lineHeight: '1.6', marginBottom: event.amount ? '16px' : '0' }}>
                    {event.description}
                  </p>

                  {event.amount && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)',
                      padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'center', position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: gradient }}></div>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                        Valor da Movimentação
                      </p>
                      <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>
                        {formatCurrency(event.amount)}
                      </p>
                      <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '11px', color: '#a1a1aa' }}>
                        <Activity size={12} />
                        Analisado por IA
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Action Button */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase' }}>
                    {formatDate(event.createdAt)}
                  </span>
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    background: 'transparent', border: 'none', color: '#ccff00', 
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer' 
                  }}>
                    Ver Detalhes
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function CheckCircle2({ size, color }: { size: number, color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
