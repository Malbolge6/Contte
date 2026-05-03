'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  Target, Activity, Clock, DollarSign, 
  ShoppingBag, Utensils, Car, House, 
  Smartphone, Zap, Coffee, Heart, MessageCircle, Share2, MoreHorizontal
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface TimelineEvent {
  id: string
  type: string
  title: string
  description: string
  amount?: number | null
  category?: string | null
  createdAt: Date
}

interface TimelineClientProps {
  initialEvents: TimelineEvent[]
}

function getEventIcon(type: string) {
  switch (type) {
    case 'expense': return { icon: ShoppingBag, color: '#f87171', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' }
    case 'income': return { icon: DollarSign, color: '#4ade80', gradient: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' }
    case 'alert': return { icon: AlertCircle, color: '#facc15', gradient: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)' }
    case 'goal': return { icon: Target, color: '#c084fc', gradient: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)' }
    case 'insight': return { icon: Activity, color: '#38bdf8', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)' }
    default: return { icon: Clock, color: '#ccff00', gradient: 'linear-gradient(135deg, #a3e635 0%, #ccff00 100%)' }
  }
}

export function TimelineClient({ initialEvents }: TimelineClientProps) {
  const [events, setEvents] = useState(initialEvents)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fade-in" style={{ paddingTop: '12px', paddingBottom: '100px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', padding: '0 4px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: '4px' }}>
          Feed Social
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccff00', boxShadow: '0 0 10px #ccff00' }}></div>
          <p style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: 500 }}>
            Atividade em tempo real
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {events.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(204, 255, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Activity size={40} color="#ccff00" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Silêncio no feed...
            </h3>
            <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: '1.6' }}>
              Suas movimentações e insights aparecerão aqui com um visual incrível.
            </p>
          </div>
        ) : (
          events.map((event, index) => {
            const { icon: Icon, color, gradient } = getEventIcon(event.type)
            return (
              <div 
                key={event.id} 
                className="scale-in" 
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              >
                {/* Header */}
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '50%', 
                      background: gradient, display: 'flex', 
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 15px ${color}40`
                    }}>
                      <Icon size={20} color="#000" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Contte AI</h3>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={10} color="#fff" />
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: '#71717a' }}>@{event.type} • {new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', color: '#52525b' }}>
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '0 16px 16px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '8px', lineHeight: '1.3' }}>
                    {event.title}
                  </h2>
                  <p style={{ fontSize: '15px', color: '#d4d4d8', lineHeight: '1.5', marginBottom: event.amount ? '16px' : '8px' }}>
                    {event.description}
                  </p>

                  {event.amount && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1) 0%, rgba(204, 255, 0, 0.02) 100%)',
                      padding: '20px', borderRadius: '20px', border: '1px solid rgba(204, 255, 0, 0.15)',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: '#ccff00', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        Valor do Evento
                      </p>
                      <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                        {formatCurrency(event.amount)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Interaction */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                    <Heart size={20} fill="#f87171" strokeWidth={0} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>24</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa' }}>
                    <MessageCircle size={20} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Comentar</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Share2 size={18} color="#71717a" />
                  </div>
                </div>

                {/* Category Tag */}
                {event.category && (
                  <div style={{ position: 'absolute', top: '16px', right: '50px', fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px', color: '#a1a1aa', fontWeight: 700, textTransform: 'uppercase' }}>
                    {event.category}
                  </div>
                )}
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
