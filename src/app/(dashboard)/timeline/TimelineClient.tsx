'use client'
// Manual redeploy trigger - Stability fix for details modal

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, AlertCircle, 
  Target, Activity, Clock, DollarSign, 
  ShoppingBag, Utensils, Car, House, 
  Smartphone, Zap, Coffee, Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, ChevronRight, Shield, X, EyeOff, Info, Globe, ExternalLink, Loader2, Eye
} from 'lucide-react'
import { getFinancialNews } from '@/actions/news'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { createPortal } from 'react-dom'
import { useTheme } from '@/contexts/ThemeContext'

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

interface TimelineClientProps {
  initialEvents: TimelineEvent[]
  hourlyRate?: number
}

export function TimelineClient({ initialEvents = [], hourlyRate = 0 }: TimelineClientProps) {
  const { privacyMode, setPrivacyMode } = useTheme()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [news, setNews] = useState<any[]>([])
  const [loadingNews, setLoadingNews] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (activeFilter === 'Notícias') {
      loadNews()
    }
  }, [activeFilter])

  async function loadNews() {
    setLoadingNews(true)
    try {
      const data = await getFinancialNews()
      setNews(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingNews(false)
    }
  }

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
          { label: 'Notícias', icon: '📈', color: '#ccff00' },
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
        <button 
          onClick={() => setPrivacyMode(!privacyMode)}
          style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer', marginLeft: '10px'
          }}
        >
          {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeFilter === 'Notícias' ? (
          loadingNews ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Loader2 className="animate-spin" size={32} color="#ccff00" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#71717a', fontSize: '14px' }}>Sintonizando rádio mercado...</p>
            </div>
          ) : (
            news.map((item, i) => (
              <div key={i} className="scale-in" style={{ 
                background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.06)',
                padding: '20px', animationDelay: `${i * 0.05}s`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={14} color="#ccff00" />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#ccff00', textTransform: 'uppercase' }}>{item.source}</span>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '12px', lineHeight: '1.4' }}>{item.title}</h2>
                <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.5', marginBottom: '20px' }}>{item.contentSnippet?.slice(0, 150)}...</p>
                <button 
                  onClick={() => window.open(item.link, '_blank')}
                  style={{ 
                    width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
                    background: '#fff', color: '#000', fontWeight: 800, fontSize: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                  }}
                >
                  Ler Notícia Completa
                  <ExternalLink size={16} />
                </button>
              </div>
            ))
          )
        ) : filteredEvents.length === 0 ? (
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
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowMenu(showMenu === event.id ? null : event.id)}
                      style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '4px' }}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {showMenu === event.id && (
                      <div className="fade-in" style={{ 
                        position: 'absolute', top: '100%', right: 0, width: '180px', 
                        background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px', padding: '8px', zIndex: 100,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}>
                        <button 
                          onClick={() => { alert('Evento ocultado localmente'); setShowMenu(null); }}
                          style={{ 
                            width: '100%', padding: '10px', borderRadius: '10px', border: 'none', 
                            background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                          }}
                        >
                          <EyeOff size={14} color="#71717a" />
                          Ocultar este post
                        </button>
                        <button 
                          onClick={() => { alert('Feedback enviado para a IA'); setShowMenu(null); }}
                          style={{ 
                            width: '100%', padding: '10px', borderRadius: '10px', border: 'none', 
                            background: 'transparent', color: '#fff', fontSize: '13px', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                          }}
                        >
                          <Activity size={14} color="#71717a" />
                          Menos como este
                        </button>
                      </div>
                    )}
                  </div>
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
                      <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }} className="blur-amount">
                        {formatCurrency(event.amount)}
                      </p>
                      {hourlyRate > 0 && event.type === 'expense' && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#ccff00', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Clock size={12} />
                          Isso custou {(event.amount / hourlyRate).toFixed(1)} horas de trabalho
                        </div>
                      )}
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
                  <button 
                    onClick={() => setSelectedEvent(event)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', 
                      background: 'transparent', border: 'none', color: '#ccff00', 
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer' 
                    }}
                  >
                    Ver Detalhes
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
      {selectedEvent && (
        <DetailsModal event={selectedEvent} hourlyRate={hourlyRate} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  )
}

function DetailsModal({ event, hourlyRate, onClose }: { event: TimelineEvent; hourlyRate: number; onClose: () => void }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.body);
  }, []);

  // Defensive icon check
  let iconData;
  try {
    iconData = getEventIcon(event?.type || 'default', event?.profileType);
  } catch (e) {
    iconData = { icon: Clock, color: '#ccff00', gradient: 'linear-gradient(135deg, #a3e635 0%, #ccff00 100%)', label: 'Contte Intelligence' };
  }
  
  const { icon: Icon, color, gradient, label: profileLabel } = iconData;

  // Check if event data is "broken" (e.g. deleted bill)
  const isBroken = !event || !event.title || event.title.includes('undefined');

  if (!target) return null;

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ background: '#0a0a0a' }}>
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '12px auto 0' }} />
        
        <div style={{ padding: '24px' }}>
          {isBroken ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Ops, não tem nada aqui!</h2>
              <p style={{ fontSize: '15px', color: '#71717a', lineHeight: '1.6', marginBottom: '24px' }}>
                Acho que você apagou ou reverteu essa conta para pendente, por isso os detalhes não estão mais disponíveis.
              </p>
              <button onClick={onClose} style={{ padding: '14px 24px', borderRadius: '14px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Entendi, fechar
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', 
                    background: gradient, display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={24} color="#000" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{profileLabel}</h3>
                    <p style={{ fontSize: '13px', color: '#71717a' }}>
                      @{event.type || 'contte'} • {event.createdAt ? `Postado às ${new Date(event.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Recentemente'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px', lineHeight: '1.2' }}>{event.title}</h2>
                <p style={{ fontSize: '16px', color: '#a1a1aa', lineHeight: '1.7' }}>{event.description}</p>
              </div>

              {event.amount && (
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '24px', 
                  border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginBottom: '32px'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Valor Total</p>
                  <p style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-2px' }} className="blur-amount">{formatCurrency(event.amount)}</p>
                  {hourlyRate > 0 && event.type === 'expense' && (
                    <p style={{ color: '#ccff00', fontSize: '14px', fontWeight: 700, marginTop: '12px' }}>
                       ⏱️ {(event.amount / hourlyRate).toFixed(1)} horas de vida dedicadas
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(204, 255, 0, 0.05)', borderRadius: '16px', border: '1px solid rgba(204, 255, 0, 0.1)' }}>
                  <Sparkles size={18} color="#ccff00" />
                  <p style={{ fontSize: '13px', color: '#ccff00', fontWeight: 600 }}>Este evento foi processado pela inteligência do Contte.</p>
                </div>
                
                <button onClick={onClose} style={{ width: '100%', padding: '18px', borderRadius: '20px', border: 'none', background: '#fff', color: '#000', fontWeight: 800, fontSize: '15px', marginTop: '12px', cursor: 'pointer' }}>
                  Fechar Detalhes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    target
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
