'use client'

import { useState } from 'react'
import { Bot, Plus, X, Zap, Loader2, PlayCircle, Settings2, ShieldCheck, MessageSquare } from 'lucide-react'
import { createPortal } from 'react-dom'

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
    status: 'active',
  },
  {
    id: 'megamen',
    name: 'Megamen',
    tagline: 'Alerta quando seus gastos do dia passarem de R$100',
    icon: '🚀',
    color: '#FF4500',
    status: 'active',
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
  
  // Chat / Interaction state
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null)
  const [agentResponse, setAgentResponse] = useState<{ id: string, name: string, text: string, color: string } | null>(null)

  const toggleAgent = (id: string) => {
    if (activeAgents.includes(id)) {
      setActiveAgents(activeAgents.filter(a => a !== id))
    } else {
      setActiveAgents([...activeAgents, id])
    }
  }

  const handleRunAgent = async (agent: typeof AGENTS[0] | { id: string, name: string, color: string }, prompt?: string) => {
    setLoadingAgentId(agent.id)
    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, customPrompt: prompt })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao conectar com a IA')
      }

      setAgentResponse({
        id: agent.id,
        name: agent.name,
        text: data.response,
        color: agent.color
      })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingAgentId(null)
    }
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCreate(false)
    handleRunAgent({ id: 'custom', name: customName, color: '#4ade80' }, customPrompt)
    setCustomName('')
    setCustomPrompt('')
  }

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>
              Agentes IA
            </h1>
            <span style={{ padding: '4px 8px', background: 'rgba(255, 107, 0, 0.15)', color: '#FF6B00', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>LIVE</span>
          </div>
          <p style={{ color: '#71717a', fontSize: '15px', maxWidth: '500px', lineHeight: 1.5 }}>
            O cérebro financeiro da Contte. Ative os agentes para analisar seus dados em tempo real ou crie comandos customizados.
          </p>
        </div>
        
        <button onClick={() => setShowCreate(true)} style={{
          padding: '14px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF6B00, #FF8A00)',
          color: '#000', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 25px rgba(255, 107, 0, 0.25)'
        }}>
          <Plus size={20} />
          Agente Custom
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {AGENTS.map((agent) => {
          const isActive = activeAgents.includes(agent.id)
          const isLocked = agent.status === 'locked'
          const isLoading = loadingAgentId === agent.id

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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isActive && (
                      <button 
                        onClick={() => handleRunAgent(agent)} 
                        disabled={isLoading}
                        style={{
                          height: '44px', padding: '0 16px', borderRadius: '14px', border: 'none',
                          background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                        Pedir Análise
                      </button>
                    )}
                    <button onClick={() => toggleAgent(agent.id)} style={{
                      width: '44px', height: '44px', borderRadius: '14px', border: 'none',
                      background: isActive ? agent.color : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#000' : '#fff', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isActive ? <Zap size={20} fill="#000" /> : <PlayCircle size={22} />}
                    </button>
                  </div>
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
            </div>
          )
        })}
      </div>

      {/* Modal para exibir a resposta do Agente */}
      {agentResponse && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAgentResponse(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', margin: 'auto' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${agentResponse.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={24} color={agentResponse.color} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{agentResponse.name}</h2>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>Relatório do Sistema</p>
                </div>
                <button onClick={() => setAgentResponse(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.02)', padding: '20px', 
                borderRadius: '16px', border: `1px solid rgba(255,255,255,0.05)`,
                color: '#e4e4e7', fontSize: '15px', lineHeight: 1.6,
                whiteSpace: 'pre-wrap' // Important for markdown/newlines from Claude
              }}>
                {agentResponse.text}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Criar Custom */}
      {showCreate && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Criar Agente</h2>
                  <p style={{ fontSize: '13px', color: '#71717a' }}>Defina a ordem. Ele usará a IA para analisar seus dados.</p>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCustom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>NOME DO AGENTE</label>
                  <input 
                    type="text" className="input-field" placeholder="Ex: Conselheiro Mestre" required
                    value={customName} onChange={e => setCustomName(e.target.value)} autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>INSTRUÇÃO DA IA (PROMPT)</label>
                  <textarea 
                    className="input-field" rows={4} required style={{ resize: 'none' }}
                    placeholder="Ex: Analise meus últimos gastos e identifique categorias onde posso cortar custos este mês."
                    value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={loadingAgentId === 'custom'} style={{
                  height: '56px', borderRadius: '16px', background: '#4ade80', color: '#000',
                  fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: loadingAgentId === 'custom' ? 0.7 : 1
                }}>
                  {loadingAgentId === 'custom' ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                  {loadingAgentId === 'custom' ? 'Processando dados...' : 'Executar Agora'}
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
