'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Sparkles, BrainCircuit, Bot, User, ChevronDown, Activity } from 'lucide-react'
import { createPortal } from 'react-dom'

export function MIA() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Olá! Eu sou a MIA, sua Inteligência Amiga. Como posso te ajudar a dominar suas finanças hoje? 🚀' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  if (!mounted) return null

  const knowledgeBase = {
    "aba contas": "Na aba Contas você gerencia seus boletos. Agora temos a função de Comprovantes onde você pode organizar tudo em pastas como 'Sabesp' ou 'Internet'.",
    "timeline": "O Feed (Timeline) é onde você vê sua vida financeira em tempo real. Posts sobre gastos, dicas da Contte AI e novidades do mercado aparecem lá.",
    "metas": "Em Metas, você pode criar 'Cofres'. Ao clicar em uma meta, você pode guardar dinheiro nela selecionando um banco específico.",
    "admin": "O Painel Admin é exclusivo para o Bruno. Lá ele cria posts oficiais da Contte Finance e Contte Notícias.",
    "tema": "Você pode mudar o tema nas configurações: Original (Verde Contte), Dark ou White.",
    "como funciona": "O Contte organiza suas contas, ajuda a economizar com metas e te dá insights automáticos no feed. Somos seu braço direito financeiro!",
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setIsTyping(true)

    // Simulate Thinking
    setTimeout(() => {
      let response = "Puxa, que pergunta interessante! Deixa eu verificar aqui... No momento estou aprendendo mais sobre você, mas posso te dizer que o Contte está aqui para simplificar sua vida. Experimente olhar o seu Feed para ver seus últimos insights!"

      const lowerInput = userMsg.toLowerCase()
      for (const [key, value] of Object.entries(knowledgeBase)) {
        if (lowerInput.includes(key)) {
          response = value
          break
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1500)
  }

  const chatUI = (
    <div 
      className="fade-in"
      style={{
        position: 'fixed', bottom: '100px', right: '20px', 
        width: '350px', height: '500px', 
        background: 'rgba(10, 10, 10, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '30px', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000, overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px', background: 'linear-gradient(135deg, #ccff00 0%, #a3e635 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#ccff00" />
          </div>
          <div>
            <h3 style={{ color: '#000', fontWeight: 900, fontSize: '16px' }}>MIA</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000', opacity: 0.5 }}></div>
              <span style={{ fontSize: '10px', color: '#000', fontWeight: 700, opacity: 0.7 }}>Online</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={18} color="#000" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: m.role === 'user' ? '#ccff00' : 'rgba(255,255,255,0.05)',
            color: m.role === 'user' ? '#000' : '#fff',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '1.5'
          }}>
            {m.content}
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '4px' }}>
            <div className="dot-typing" style={{ width: '4px', height: '4px', background: '#ccff00', borderRadius: '50%' }}></div>
            <div className="dot-typing" style={{ width: '4px', height: '4px', background: '#ccff00', borderRadius: '50%', animationDelay: '0.2s' }}></div>
            <div className="dot-typing" style={{ width: '4px', height: '4px', background: '#ccff00', borderRadius: '50%', animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '15px 20px 25px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte algo para a MIA..."
          style={{ 
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '15px', padding: '12px 15px', color: '#fff', fontSize: '14px', outline: 'none'
          }}
        />
        <button type="submit" style={{ 
          width: '45px', height: '45px', borderRadius: '15px', 
          background: '#ccff00', border: 'none', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
        }}>
          <Send size={20} color="#000" />
        </button>
      </form>
    </div>
  )

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '100px', right: '20px',
          width: '60px', height: '60px', borderRadius: '30px',
          background: 'linear-gradient(135deg, #ccff00 0%, #a3e635 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(204, 255, 0, 0.3)',
          border: 'none', cursor: 'pointer', zIndex: 1001,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {isOpen ? <X size={28} color="#000" /> : <BrainCircuit size={28} color="#000" />}
      </button>

      {isOpen && createPortal(chatUI, document.body)}
    </>
  )
}
