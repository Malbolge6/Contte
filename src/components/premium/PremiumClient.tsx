'use client'

import { useState } from 'react'
import { Check, Star, Loader2, ShieldCheck, Zap } from 'lucide-react'

export function PremiumClient({ isPremium }: { isPremium: boolean }) {
  const [loading, setLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao iniciar checkout')
    } finally {
      setLoading(false)
    }
  }

  async function handleManage() {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao acessar portal')
    } finally {
      setBillingLoading(false)
    }
  }

  return (
    <div className="fade-in" style={{ padding: '20px 0 100px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        width: '80px', height: '80px', margin: '0 auto 24px',
        background: 'radial-gradient(circle, rgba(204, 255, 0, 0.2) 0%, transparent 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #ccff00, #99cc00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(204, 255, 0, 0.4)'
        }}>
          <Star size={32} color="#050505" fill="#050505" />
        </div>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#f8f9fa', letterSpacing: '-1px', marginBottom: '12px' }}>
        {isPremium ? 'Você é Premium! 🎉' : 'Contte Premium'}
      </h1>
      <p style={{ color: '#a0a0b0', fontSize: '15px', lineHeight: 1.5, marginBottom: '32px' }}>
        {isPremium 
          ? 'Você tem acesso ilimitado a todas as ferramentas financeiras da plataforma. Obrigado por apoiar!' 
          : 'Desbloqueie o controle financeiro definitivo. Sem limites artificiais, sem complexidade.'}
      </p>

      {!isPremium && (
        <div className="card" style={{ padding: '24px', textAlign: 'left', marginBottom: '32px', border: '1px solid rgba(204, 255, 0, 0.3)', background: 'rgba(204, 255, 0, 0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ccff00', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} /> Tudo liberado
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Transações e extrato ilimitados',
              'Contas a pagar sem restrições',
              'Metas financeiras avançadas',
              'Anexar comprovantes e documentos',
              'Grupos organizacionais (Energia, Água, etc)',
              'Simulação rápida de impacto'
            ].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>
                <Check size={16} color="#ccff00" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isPremium ? (
        <button 
          onClick={handleManage}
          disabled={billingLoading}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '16px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {billingLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
          {billingLoading ? 'Carregando...' : 'Gerenciar Assinatura'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            className="btn-accent"
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 20px rgba(204, 255, 0, 0.3)'
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" color="#050505" /> : null}
            {loading ? 'Preparando checkout...' : 'Assinar Contte Premium'}
          </button>
          <p style={{ fontSize: '13px', color: '#6b6b80', fontWeight: 500 }}>
            Apenas R$ 9,90/mês. Cancele a qualquer momento.
          </p>
        </div>
      )}
    </div>
  )
}
