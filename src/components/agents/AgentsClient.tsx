'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Plus, X, Zap, Loader2, ShieldCheck, Send, Sparkles, MessageSquare } from 'lucide-react'
import { createPortal } from 'react-dom'

const AGENTS = [
  {
    id: 'antonio',
    name: 'Antonio',
    tagline: 'Analisa seu caixa e organiza sua vida financeira',
    image: '/images/antonio.png',
    color: '#FF6B00',
    emoji: '🦦',
    status: 'active',
  },
  {
    id: 'claudia',
    name: 'Claudia',
    tagline: 'Encontra cobranças duplicadas no seu extrato',
    image: '/images/claudia.png',
    color: '#FF8A00',
    emoji: '🦉',
    status: 'active',
  },
  {
    id: 'lamar',
    name: 'Lamar',
    tagline: 'Especialista em metas, planos e conquistas financeiras',
    image: '/images/lamar.png',
    color: '#FF4500',
    emoji: '🦝',
    status: 'active',
  },
  {
    id: 'manuel',
    name: 'Manuel',
    tagline: 'Analisa e sugere onde você pode economizar mais',
    image: '/images/manuel.png',
    color: '#E65100',
    emoji: '🦥',
    status: 'active',
  },
  {
    id: 'dante',
    name: 'Dante',
    tagline: 'Contador da Contte, responsável pela parte fiscal e tributos',
    image: '/images/dante.png',
    color: '#2E7D32',
    emoji: '🐢',
    status: 'active',
  },
]

type Message = { id: string; role: 'user' | 'ai'; content: string; agentName?: string }

export function AgentsClient() {
  const [activeTab, setActiveTab] = useState<'agentes' | 'chat'>('agentes')
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'Olá! Sou a **Contte AI**, o cérebro central da sua conta. Conheço todo o seu histórico financeiro. O que você quer analisar hoje?', agentName: 'Contte AI' }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null)
  const [agentResponse, setAgentResponse] = useState<{ id: string; name: string; text: string; color: string } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleRunAgent = async (agent: typeof AGENTS[0] | { id: string; name: string; color: string; emoji?: string }, prompt?: string) => {
    setLoadingAgentId(agent.id)
    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, customPrompt: prompt })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na análise')
      setAgentResponse({ id: agent.id, name: agent.name, text: data.response, color: (agent as any).color || '#FF6B00' })
    } catch (err: any) {
      setAgentResponse({ id: agent.id, name: agent.name, text: `⚠️ Erro ao contatar o agente: ${err.message}`, color: '#f43f5e' })
    } finally {
      setLoadingAgentId(null)
    }
  }

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
      if (!res.ok) throw new Error(data.error || 'Erro')
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: data.response, agentName: 'Contte AI' }])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: `⚠️ ${err.message}`, agentName: 'Sistema' }])
    } finally {
      setLoadingChat(false)
    }
  }

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault()
    setShowCreate(false)
    handleRunAgent({ id: 'custom', name: customName || 'Agente Custom', color: '#4ade80', emoji: '🤖' }, customPrompt)
    setCustomName('')
    setCustomPrompt('')
  }

  if (!mounted) return null

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>Inteligência</h1>
          <span style={{ padding: '4px 8px', background: 'rgba(255, 107, 0, 0.15)', color: '#FF6B00', borderRadius: '8px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} fill="#FF6B00" /> IA
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', gap: '4px' }}>
          {([
            { key: 'agentes', label: 'Agentes de Elite', icon: <Bot size={16} /> },
            { key: 'chat', label: 'Chat Contte AI', icon: <MessageSquare size={16} /> },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '13px',
              transition: 'all 0.2s', cursor: 'pointer',
              background: activeTab === tab.key ? 'rgba(255, 107, 0, 0.15)' : 'transparent',
              color: activeTab === tab.key ? '#FF6B00' : '#71717a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AGENTS TAB */}
      {activeTab === 'agentes' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Clique em um agente para gerar uma análise completa.</p>
            <button onClick={() => setShowCreate(true)} style={{ height: '40px', padding: '0 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Criar Agente
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {AGENTS.map((agent) => {
              const isLoading = loadingAgentId === agent.id
              return (
                <div key={agent.id} className="hover-card" onClick={() => !isLoading && handleRunAgent(agent)} style={{
                  background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '12px',
                  border: '1px solid rgba(255,255,255,0.05)', cursor: isLoading ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', position: 'relative', background: '#121212' }}>
                    <img src={agent.image} alt={agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', opacity: 0.3 }}>{agent.emoji}</div>
                    {isLoading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={32} className="animate-spin" color={agent.color} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0 8px 8px 8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {agent.name} <Zap size={14} fill={agent.color} color={agent.color} />
                    </h3>
                    <p style={{ fontSize: '14px', color: '#71717a', lineHeight: 1.5, fontWeight: 500 }}>{agent.tagline}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: '400px' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '12px', alignItems: 'flex-end' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,107,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="#FF6B00" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.role === 'user' ? '#ccff00' : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#000' : '#e4e4e7',
                  fontSize: '14px', lineHeight: 1.6, fontWeight: msg.role === 'user' ? 600 : 400,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.agentName && <p style={{ fontSize: '11px', fontWeight: 800, color: '#FF6B00', marginBottom: '6px', textTransform: 'uppercase' }}>{msg.agentName}</p>}
                  {msg.content}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,107,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} color="#FF6B00" />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: '20px 20px 20px 4px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', animation: 'pulse 1s infinite' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B00', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <input
              type="text" className="input-field" placeholder="Pergunte algo sobre suas finanças..."
              value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={loadingChat}
              style={{ flex: 1, height: '52px' }}
            />
            <button type="submit" disabled={loadingChat || !inputValue.trim()} style={{
              width: '52px', height: '52px', borderRadius: '16px', background: '#FF6B00', color: '#000',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: loadingChat || !inputValue.trim() ? 0.5 : 1, transition: 'all 0.2s',
            }}>
              {loadingChat ? <Loader2 size={20} className="animate-spin" color="#fff" /> : <Send size={20} color="#fff" />}
            </button>
          </form>
        </div>
      )}

      {/* Agent Output Modal */}
      {agentResponse && mounted && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAgentResponse(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', margin: 'auto', maxHeight: '85vh', overflowY: 'auto' }}>
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
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', color: '#e4e4e7', fontSize: '15px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {agentResponse.text}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Custom Agent Modal */}
      {showCreate && mounted && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Criar Agente</h2>
                  <p style={{ fontSize: '13px', color: '#71717a' }}>Agente personalizado para sua necessidade.</p>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateCustom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>NOME DO AGENTE</label>
                  <input type="text" className="input-field" placeholder="Ex: Conselheiro Mestre" required value={customName} onChange={e => setCustomName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px' }}>A MISSÃO DELE (PROMPT)</label>
                  <textarea className="input-field" rows={4} required style={{ resize: 'none' }}
                    placeholder="Ex: Analise meus gastos de hoje e me diga o que cortar." value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />
                </div>
                <button type="submit" disabled={loadingAgentId === 'custom'} style={{
                  height: '56px', borderRadius: '16px', background: '#FF6B00', color: '#000',
                  fontSize: '16px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: loadingAgentId === 'custom' ? 0.7 : 1,
                }}>
                  {loadingAgentId === 'custom' ? <Loader2 size={20} className="animate-spin" /> : <Bot size={20} />}
                  {loadingAgentId === 'custom' ? 'Gerando...' : 'Gerar & Executar Agora'}
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
