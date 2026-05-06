'use client'

import { useState } from 'react'
import { Bot, Plus, X, Zap, Loader2, PlayCircle, Settings2, ShieldCheck } from 'lucide-react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

// Using generic placeholders since the generated images are in the brain folder
const AGENTS = [
  {
    id: 'jubileu',
    name: 'Jubileu',
    tagline: 'Analisa seu caixa e organiza sua vida financeira',
    icon: '👔',
    color: '#FF6B00',
    status: 'active',
  },
  {
    id: 'detetive',
    name: 'Detetive Duplicatas',
    tagline: 'Encontra cobranças duplicadas no seu extrato',
    icon: '🕵️',
    color: '#FF8A00',
    status: 'inactive',
  },
  {
    id: 'megamen',
    name: 'Megamen',
    tagline: 'Alerta quando seus gastos do dia passarem de R$100',
    icon: '🚀',
    color: '#FF4500',
    status: 'inactive',
  },
  {
    id: 'santos',
    name: 'Santos Dumont',
    tagline: 'Caçador de passagens baratas saindo da sua cidade',
    icon: '✈️',
    color: '#E65100',
    status: 'locked',
  }
]

export function AgentsClient() {
  const [activeAgents, setActiveAgents] = useState<string[]>(['jubileu'])
  const [showCreate, setShowCreate] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleAgent = (id: string) => {
    if (activeAgents.includes(id)) {
      setActiveAgents(activeAgents.filter(a => a !== id))
    } else {
      setActiveAgents([...activeAgents, id])
    }
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call to Claude
    setTimeout(() => {
      setLoading(false)
      setShowCreate(false)
      alert(`Agente "${customName}" criado com sucesso! Ele agora monitora sua conta.`)
      setCustomName('')
      setCustomPrompt('')
    }, 1500)
  }

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>
              Agentes IA
            </h1>
            <span style={{ padding: '4px 8px', background: 'rgba(255, 107, 0, 0.15)', color: '#FF6B00', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>BETA</span>
          </div>
          <p style={{ color: '#71717a', fontSize: '15px', maxWidth: '500px', lineHeight: 1.5 }}>
            Pequenos robôs baseados em Inteligência Artificial que trabalham 24/7 na sua conta. Ative os que você precisa ou crie o seu próprio.
          </p>
        </div>
        
        <button onClick={() => setShowCreate(true)} style={{
          padding: '14px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF6B00, #FF8A00)',
          color: '#000', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(255, 107, 0, 0.25)'
        }}>
          <Plus size={20} />
          Criar Meu Agente
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {AGENTS.map((agent) => {
          const isActive = activeAgents.includes(agent.id)
          const isLocked = agent.status === 'locked'

          return (
            <div key={agent.id} className="scale-in" style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${isActive ? agent.color : 'rgba(255,255,255,0.05)'}`,
              borderRadius: '24px', padding: '24px', position: 'relative',
              overflow: 'hidden', transition: 'all 0.3s',
              boxShadow: isActive ? `0 0 20px ${agent.color}15` : 'none',
              opacity: isLocked ? 0.5 : 1
            }}>
              {isActive && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle at top right, ${agent.color}30, transparent)`, zIndex: 0 }} />
              )}
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '18px',
                  background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', border: `1px solid ${agent.color}30`
                }}>
                  {agent.icon}
                </div>
                {isLocked ? (
                  <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 700, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    EM BREVE
                  </span>
                ) : (
                  <button onClick={() => toggleAgent(agent.id)} style={{
                    width: '44px', height: '44px', borderRadius: '14px', border: 'none',
                    background: isActive ? agent.color : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#000' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isActive ? <Zap size={20} fill="#000" /> : <PlayCircle size={22} />}
                  </button>
                )}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                  {agent.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: 1.5 }}>
                  {agent.tagline}
                </p>
              </div>

              {isActive && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '8px', color: agent.color, fontSize: '12px', fontWeight: 700 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: agent.color, boxShadow: `0 0 10px ${agent.color}` }} />
                  Monitorando sua conta agora
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showCreate && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Criar Agente Personalizado</h2>
                  <p style={{ fontSize: '13px', color: '#71717a' }}>Descreva o que seu robô deve fazer com seus dados.</p>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCustom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>NOME DO AGENTE</label>
                  <input 
                    type="text" className="input-field" placeholder="Ex: Inspetor de Ifood" required
                    value={customName} onChange={e => setCustomName(e.target.value)} autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>COMANDO DO AGENTE (PROMPT)</label>
                  <textarea 
                    className="input-field" rows={4} required style={{ resize: 'none' }}
                    placeholder="Ex: Me mande uma notificação sempre que a soma dos meus gastos com 'Comida' passar de R$ 500 no mês."
                    value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                  />
                </div>

                <div style={{ padding: '16px', background: 'rgba(74, 222, 128, 0.05)', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={20} color="#4ade80" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>Segurança Garantida</h4>
                    <p style={{ fontSize: '12px', color: '#a1a1aa' }}>Este agente rodará isolado na sua conta usando a API da Anthropic. Ele não pode fazer transações reais, apenas monitorar e alertar.</p>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  height: '56px', borderRadius: '16px', background: '#FF6B00', color: '#000',
                  fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: loading ? 0.7 : 1
                }}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                  {loading ? 'Treinando Agente...' : 'Ativar Agente'}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
