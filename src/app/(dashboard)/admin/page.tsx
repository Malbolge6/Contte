'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Send, Sparkles, Newspaper, TrendingUp, 
  ShieldAlert, User, Loader2, CheckCircle2 
} from 'lucide-react'
import { createAdminPost } from '@/actions/admin'

export default function AdminPage() {
  const router = useRouter()
  const [profileType, setProfileType] = useState<'FINANCE' | 'NOTICIAS' | 'ADMIN'>('FINANCE')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createAdminPost({ profileType, title, description })
      setSuccess(true)
      setTitle('')
      setDescription('')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>Painel Admin</h1>
        <p style={{ color: '#71717a', fontSize: '14px' }}>Crie posts globais para todos os usuários.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { id: 'FINANCE', label: 'Contte Finance', icon: TrendingUp, color: '#4ade80' },
            { id: 'NOTICIAS', label: 'Contte Notícias', icon: Newspaper, color: '#38bdf8' },
            { id: 'ADMIN', label: 'Sistema', icon: ShieldAlert, color: '#f87171' },
          ].map((p) => (
            <button 
              key={p.id}
              type="button"
              onClick={() => setProfileType(p.id as any)}
              style={{
                padding: '16px 12px', borderRadius: '20px', border: '2px solid',
                borderColor: profileType === p.id ? p.color : 'transparent',
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <p.icon size={20} color={p.color} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', textAlign: 'center' }}>{p.label}</span>
            </button>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '8px', fontWeight: 700 }}>TÍTULO DO POST</label>
            <input 
              type="text" className="input-field" placeholder="Ex: Mercado em alta hoje!" 
              value={title} onChange={e => setTitle(e.target.value)} required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '8px', fontWeight: 700 }}>CONTEÚDO</label>
            <textarea 
              className="input-field" rows={5} placeholder="O que você quer dizer para seus usuários?"
              value={description} onChange={e => setDescription(e.target.value)} required
              style={{ resize: 'none' }}
            />
          </div>
        </div>

        {success && (
          <div className="fade-in" style={{ padding: '16px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '15px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            <CheckCircle2 size={20} /> Post enviado com sucesso para todos!
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ height: '60px', borderRadius: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          Publicar para todos os usuários
        </button>
      </form>
    </div>
  )
}
