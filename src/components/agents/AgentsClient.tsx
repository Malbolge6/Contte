'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Plus, X, Zap, Loader2, PlayCircle, ShieldCheck, MessageSquare, Send, Sparkles, BrainCircuit } from 'lucide-react'
import { createPortal } from 'react-dom'

const AGENTS = [
  {
    id: 'antonio',
    name: 'Antonio',
    tagline: 'Analisa seu caixa e organiza sua vida financeira',
    image: '/images/antonio.png',
    color: '#FF6B00',
    status: 'active',
  },
  {
    id: 'claudia',
    name: 'Claudia',
    tagline: 'Encontra cobranças duplicadas no seu extrato',
    image: '/images/claudia.png',
    color: '#FF8A00',
    status: 'active',
  },
  {
    id: 'lamar',
    name: 'Lamar',
    tagline: 'Especialista em metas, planos e conquistas financeiras',
    image: '/images/lamar.png',
    color: '#FF4500',
    status: 'active',
  },
  {
    id: 'manuel',
    name: 'Manuel',
    tagline: 'Analisa e sugere onde você pode economizar mais',
    image: '/images/manuel.png',
    color: '#E65100',
    status: 'active',
  },
]

export function AgentsClient() {
  const [activeTab, setActiveTab] = useState<'chat' | 'agentes'>('agentes')
  const [activeAgents, setActiveAgents] = useState<string[]>(['antonio'])
  
  // Custom Agent Creation
  const [showCreate, setShowCreate] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  
  // Chat State
  const [messages, setMessages] = useState<{ id: string, role: 'user' | 'ai', content: string, agentName?: string }[]>([
    { id: '1', role: 'ai', content: 'Olá! Sou a Contte AI, o cérebro central da sua conta. Eu conheço todo o seu histórico financeiro. O que você quer analisar hoje?', agentName: 'Contte AI' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Agent Report State
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null)
  const [agentResponse, setAgentResponse] = useState<{ id: string, name: string, text: string, color: string } | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleAgent = (id: string) => {
    if (activeAgents.includes(id)) {
      setActiveAgents(activeAgents.filter(a => a !== id))
    } else {
      setActiveAgents([...activeAgents, id])
    }
  }

  // Action para mandar msg pro chat livre
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || loadingChat) return

    const userMsg = inputValue.trim()
    setInputValue('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }])
    setLoadingChat(true)

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'chat', customPrompt: userMsg })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: data.response, agentName: 'Contte AI' }])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: `Erro: ${err.message}`, agentName: 'Sistema' }])
    } finally {
      setLoadingChat(false)
    }
  }

  // Action para pedir analise de um Agente especifico
  const handleRunAgent = async (agent: typeof AGENTS[0] | { id: string, name: string, color: string }, prompt?: string) => {
    setLoadingAgentId(agent.id)
    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, customPrompt: prompt })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error)

      setAgentResponse({ id: agent.id, name: agent.name, text: data.response, color: agent.color })
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
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      
      {/* Header & Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>
            Inteligência
          </h1>
          <span style={{ padding: '4px 8px', background: 'rgba(255, 107, 0, 0.15)', color: '#FF6B00', borderRadius: '8px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} fill="#FF6B00" /> AGENTES
          </span>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
              fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
              background: 'rgba(255, 107, 0, 0.15)',
              color: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Bot size={18} /> Robôs Agentes de Elite
          </button>
        </div>
      </div>

      {/* --- CHAT TAB (HIDDEN) --- */}
      {activeTab === 'chat' && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#71717a' }}>
          O Chat Inteligente está em manutenção. Use os Robôs Agentes abaixo.
        </div>
      )}

      {/* --- AGENTES TAB --- */}
      {activeTab === 'agentes' && (
        <div className="fade-in" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Ative robôs focados em missões específicas.</p>
            <button onClick={() => setShowCreate(true)} style={{
              padding: '10px 16px', borderRadius: '12px', background: '#FF6B00',
              color: '#000', border: 'none', display: 'flex', alignItems: 'center', gap: '6px',
              fontWeight: 800, cursor: 'pointer'
            }}>
              <Plus size={16} /> Criar Novo
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {AGENTS.map((agent) => {
              const isActive = activeAgents.includes(agent.id)
              const isLocked = agent.status === 'locked'
              const isLoading = loadingAgentId === agent.id

              return (
                <div 
                  key={agent.id}
                  className="hover-card"
                  onClick={() => !isLocked && handleRunAgent(agent)}
                  style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '12px',
                    border: '1px solid rgba(255,255,255,0.05)', cursor: !isLocked ? 'pointer' : 'default',
                    transition: 'all 0.3s ease', opacity: isLocked ? 0.6 : 1
                  }}
                >
                  {/* Agent Image */}
                  <div style={{ 
                    width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', 
                    marginBottom: '16px', position: 'relative', background: '#121212'
                  }}>
                    {agent.image ? (
                      <img 
                        src={agent.image} 
                        alt={agent.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                        {agent.icon || '🤖'}
                      </div>
                    )}
                    {isLocked && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <div style={{ background: '#000', padding: '12px', borderRadius: '50%' }}>
                          <ShieldCheck size={24} color="#71717a" />
                        </div>
                      </div>
                    )}
                    {isLoading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={32} className="animate-spin" color="#FF6B00" />
                      </div>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div style={{ padding: '0 8px 8px 8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {agent.name}
                      {isActive && <Zap size={14} fill="#FF6B00" color="#FF6B00" />}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.5, fontWeight: 500 }}>
                      {agent.tagline}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Agent Output Modal */}
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
                color: '#e4e4e7', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-wrap'
              }}>
                {agentResponse.text}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Custom Agent Modal */}
      {showCreate && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Criar Agente</h2>
                  <p style={{ fontSize: '13px', color: '#71717a' }}>Este robô existirá apenas para você.</p>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>A MISSÃO DELE (PROMPT)</label>
                  <textarea 
                    className="input-field" rows={4} required style={{ resize: 'none' }}
                    placeholder="Ex: Você é um conselheiro chato. Analise meus gastos de hoje e reclame de tudo que não for essencial."
                    value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={loadingAgentId === 'custom'} style={{
                  height: '56px', borderRadius: '16px', background: '#FF6B00', color: '#000',
                  fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: loadingAgentId === 'custom' ? 0.7 : 1
                }}>
                  {loadingAgentId === 'custom' ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                  {loadingAgentId === 'custom' ? 'Criando Consciência...' : 'Gerar & Executar Agora'}
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
