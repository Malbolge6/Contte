'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  Target, Activity, Clock, DollarSign, 
  ShoppingBag, Utensils, Car, House, 
  Smartphone, Zap, Coffee, Heart
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
    case 'expense': return { icon: ShoppingBag, color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' }
    case 'income': return { icon: DollarSign, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' }
    case 'alert': return { icon: AlertCircle, color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' }
    case 'goal': return { icon: Target, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)' }
    case 'insight': return { icon: Activity, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' }
    default: return { icon: Clock, color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.1)' }
  }
}

export function TimelineClient({ initialEvents }: TimelineClientProps) {
  const [events, setEvents] = useState(initialEvents)

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Timeline
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
          O que está acontecendo com seu dinheiro
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Activity size={48} color="#71717a" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Sua timeline está vazia
            </h3>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
              Comece a registrar transações para ver seu feed dinâmico ganhar vida.
            </p>
          </div>
        ) : (
          events.map((event, index) => {
            const { icon: Icon, color, bg } = getEventIcon(event.type)
            return (
              <div 
                key={event.id} 
                className="card scale-in" 
                style={{ 
                  padding: '20px', 
                  animationDelay: `${index * 0.05}s`,
                  borderLeft: `4px solid ${color}`,
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Icon Side */}
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '14px', 
                    background: bg, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                  }}>
                    <Icon size={24} color={color} />
                  </div>

                  {/* Content Side */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                        {event.title}
                      </h3>
                      <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 500 }}>
                        {new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.5', marginBottom: event.amount ? '12px' : '0' }}>
                      {event.description}
                    </p>

                    {event.amount && (
                      <div style={{ 
                        display: 'inline-block', padding: '6px 12px', borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.05)', fontSize: '16px', fontWeight: 800, color: '#fff' 
                      }}>
                        {formatCurrency(event.amount)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                    {formatDate(event.createdAt)}
                  </span>
                  {event.category && (
                    <span style={{ fontSize: '11px', color: color, background: bg, padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {event.category}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
