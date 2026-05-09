'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, X, Target, TrendingUp, Loader2, AlertCircle,
  Trash2, Edit2, ChevronRight, ArrowUpCircle, 
  ArrowDownCircle, Wallet as WalletIcon, History, Sparkles, CheckCircle2
} from 'lucide-react'
import { formatCurrency, CATEGORIES, maskCurrency, parseCurrency } from '@/lib/helpers'
import { createGoal, deleteGoal } from '@/actions/goals'
import { addGoalContribution, getGoalContributions } from '@/actions/goals_extra'
import { createPortal } from 'react-dom'

interface Goal {
  id: string
  name: string
  category: string
  limitAmount?: number | null
  targetAmount?: number | null
  currentAmount: number
  type: string
  period: string
}

interface Wallet {
  id: string
  name: string
  balance: number
  color?: string | null
}

interface GoalsClientProps {
  goals: Goal[]
  wallets: Wallet[]
}

// --- Modals ---

function GoalDetailsModal({ goal, wallets, onClose }: { goal: Goal; wallets: Wallet[]; onClose: () => void }) {
  const router = useRouter()
  const [contributions, setContributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [addType, setAddType] = useState<'ADD' | 'SUBTRACT'>('ADD')
  const [amount, setAmount] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getGoalContributions(goal.id)
        setContributions(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [goal.id])

  async function handleContribution(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addGoalContribution({
        goalId: goal.id,
        amount: parseCurrency(amount),
        type: addType,
        walletId: selectedWalletId || undefined
      })
      router.refresh()
      onClose()
    } catch (err) {
      alert('Erro ao registrar aporte')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
        
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>{goal.name}</h2>
              <p style={{ fontSize: '13px', color: '#71717a' }}>{goal.type === 'LIMIT' ? 'Controle de Gastos' : 'Meta de Economia'}</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.1) 0%, rgba(204, 255, 0, 0.02) 100%)',
            padding: '24px', borderRadius: '24px', border: '1px solid rgba(204, 255, 0, 0.15)',
            textAlign: 'center', marginBottom: '24px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#ccff00', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Saldo Atual</p>
            <p style={{ fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>{formatCurrency(goal.currentAmount)}</p>
            {goal.targetAmount && (
              <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '8px' }}>Objetivo final: {formatCurrency(goal.targetAmount)}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            <button onClick={() => { setAddType('ADD'); setShowAddMoney(true); }} style={{ 
              padding: '16px', borderRadius: '20px', border: 'none', background: 'rgba(74, 222, 128, 0.1)',
              color: '#4ade80', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}>
              <ArrowUpCircle size={24} />
              Guardar
            </button>
            <button onClick={() => { setAddType('SUBTRACT'); setShowAddMoney(true); }} style={{ 
              padding: '16px', borderRadius: '20px', border: 'none', background: 'rgba(248, 113, 113, 0.1)',
              color: '#f87171', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}>
              <ArrowDownCircle size={24} />
              Resgatar
            </button>
          </div>

          {showAddMoney && (
            <div className="fade-in" style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                {addType === 'ADD' ? 'Quanto quer guardar?' : 'Quanto quer retirar?'}
              </h3>
              <form onSubmit={handleContribution} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" className="input-field" placeholder="R$ 0,00" autoFocus
                  value={amount} onChange={e => setAmount(maskCurrency(e.target.value))} required
                />
                
                <label style={{ fontSize: '12px', color: '#71717a', fontWeight: 600 }}>De qual banco/carteira?</label>
                <select className="input-field" value={selectedWalletId} onChange={e => setSelectedWalletId(e.target.value)}>
                  <option value="">Apenas registro virtual</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id} style={{ background: '#16161f' }}>
                      {w.name} (Saldo: {formatCurrency(w.balance)})
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowAddMoney(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700 }}>Cancelar</button>
                  <button type="submit" disabled={submitting} style={{ flex: 2, padding: '12px', borderRadius: '12px', border: 'none', background: addType === 'ADD' ? '#4ade80' : '#f87171', color: '#000', fontWeight: 800 }}>
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#71717a" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>Histórico</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" color="#ccff00" /></div>
            ) : contributions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#52525b', fontSize: '13px', padding: '20px' }}>Nenhum aporte registrado ainda.</p>
            ) : (
              contributions.map((c, i) => (
                <div key={c.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {c.type === 'ADD' ? <ArrowUpCircle size={14} color="#4ade80" /> : <ArrowDownCircle size={14} color="#f87171" />}
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.type === 'ADD' ? 'Depósito' : 'Resgate'}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{new Date(c.date).toLocaleDateString('pt-BR')} {c.walletName && `• ${c.walletName}`}</p>
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: c.type === 'ADD' ? '#4ade80' : '#f87171' }}>
                    {c.type === 'ADD' ? '+' : '-'} {formatCurrency(c.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<'LIMIT' | 'SAVINGS'>('LIMIT')
  const [limitAmount, setLimitAmount] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createGoal({
        name,
        category,
        type,
        limitAmount: limitAmount ? parseCurrency(limitAmount) : undefined,
        targetAmount: targetAmount ? parseCurrency(targetAmount) : undefined,
        period,
      })
      router.refresh()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa' }}>Nova Meta</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#6b6b80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '0 20px 80px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
              {(['LIMIT', 'SAVINGS'] as const).map(t => (
                <button key={t} type="button" onClick={() => setType(t)} style={{
                  padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
                  background: type === t ? 'rgba(204, 255, 0, 0.15)' : 'transparent',
                  color: type === t ? '#ccff00' : '#6b6b80',
                }}>
                  {t === 'LIMIT' ? '🚫 Limite' : '🎯 Economia'}
                </button>
              ))}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Nome</label>
              <input type="text" className="input-field" placeholder="Ex: Viagem de Fim de Ano" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Categoria</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Selecionar</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: '#16161f' }}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            {type === 'LIMIT' ? (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Limite Mensal (R$)</label>
                <input type="text" className="input-field" placeholder="Valor máximo" value={limitAmount} onChange={e => setLimitAmount(maskCurrency(e.target.value))} />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Valor Alvo (R$)</label>
                <input type="text" className="input-field" placeholder="Quanto quer juntar?" value={targetAmount} onChange={e => setTargetAmount(maskCurrency(e.target.value))} />
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              Criar meta agora
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

// --- Main Client ---

export function GoalsClient({ goals, wallets }: GoalsClientProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showLamarBio, setShowLamarBio] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Excluir esta meta?')) return
    setDeletingId(id)
    try {
      await deleteGoal(id)
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fade-in" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>Metas</h1>
            <div style={{ padding: '4px 8px', borderRadius: '8px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Cofre</div>
          </div>
          <p style={{ color: '#71717a', fontSize: '13px', fontWeight: 500 }}>
            Planeje o seu futuro, passo a passo.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowLamarBio(!showLamarBio)}
              style={{ 
                width: '74px', height: '74px', borderRadius: '18px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative', boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>LAMAR</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/lamar.png" alt="Lamar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {showLamarBio && (
              <div className="scale-in" style={{
                position: 'absolute', top: '100%', right: '0', width: '240px',
                background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
                marginTop: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <strong>E aí, sou o Lamar!</strong> 🦝🚀<br/><br/>
                  Sou o estrategista de metas, planos e conquistas financeiras. Vou te ajudar a transformar seus sonhos em realidade, um passo de cada vez!
                </p>
                <div style={{ 
                  position: 'absolute', bottom: '100%', right: '20px', 
                  width: '0', height: '0', 
                  borderLeft: '10px solid transparent', borderRight: '10px solid transparent', 
                  borderBottom: '10px solid #000' 
                }} />
              </div>
            )}
          </div>

          <button onClick={() => setShowAdd(true)} style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {goals.length === 0 ? (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px' }}>
            <Target size={48} color="#ccff00" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Defina seu primeiro alvo</h3>
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px' }}>Economize para uma viagem ou controle seus gastos mensais.</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Criar meta
            </button>
          </div>
        ) : (
          goals.map(goal => {
            const cat = CATEGORIES.find(c => c.value === goal.category)
            const max = goal.type === 'LIMIT' ? goal.limitAmount : goal.targetAmount
            const progress = max && max > 0 ? Math.min((goal.currentAmount / max) * 100, 100) : 0
            const isOverLimit = goal.type === 'LIMIT' && max && goal.currentAmount > max
            const isComplete = goal.type === 'SAVINGS' && max && goal.currentAmount >= max

            return (
              <div 
                key={goal.id} 
                onClick={() => setSelectedGoal(goal)}
                className="scale-in card" 
                style={{ 
                  padding: '20px', cursor: 'pointer', position: 'relative', 
                  overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                {/* Visual Accent */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${goal.type === 'LIMIT' ? 'rgba(248, 113, 113, 0.05)' : 'rgba(74, 222, 128, 0.05)'}, transparent)`, zIndex: 0 }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '16px',
                      background: goal.type === 'LIMIT' ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      {cat?.icon || '🎯'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{goal.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: goal.type === 'LIMIT' ? '#f87171' : '#4ade80', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {goal.type === 'LIMIT' ? 'Limite' : 'Economia'}
                        </span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#52525b' }}></span>
                        <span style={{ fontSize: '12px', color: '#71717a' }}>{goal.period === 'monthly' ? 'Mensal' : 'Anual'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, goal.id)}
                    disabled={deletingId === goal.id}
                    style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: 'rgba(248,113,113,0.05)', border: 'none',
                      cursor: 'pointer', color: '#52525b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {deletingId === goal.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>

                {max && (
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '2px' }}>Progresso</p>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                          {formatCurrency(goal.currentAmount)} <span style={{ fontSize: '13px', fontWeight: 500, color: '#52525b' }}>/ {formatCurrency(max)}</span>
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ 
                          fontSize: '20px', fontWeight: 900, 
                          color: isOverLimit ? '#f87171' : isComplete ? '#4ade80' : '#ccff00',
                        }}>
                          {progress.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%', width: `${progress}%`,
                          background: isOverLimit ? '#f87171' : isComplete ? '#4ade80' : '#ccff00',
                          borderRadius: '10px', transition: 'width 1s ease-out',
                          boxShadow: `0 0 15px ${isOverLimit ? '#f8717140' : isComplete ? '#4ade8040' : '#ccff0040'}`
                        }}
                      />
                    </div>
                    {isOverLimit && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', fontWeight: 600 }}>
                        <AlertCircle size={14} />
                        Excedido em {formatCurrency(goal.currentAmount - max)}
                      </div>
                    )}
                    {isComplete && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>
                        <CheckCircle2 size={14} />
                        Meta alcançada! Parabéns!
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', fontSize: '12px', fontWeight: 600 }}>
                  <History size={14} />
                  Clique para ver detalhes e aportes
                </div>
              </div>
            )
          })
        )}
      </div>

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
      {selectedGoal && <GoalDetailsModal goal={selectedGoal} wallets={wallets} onClose={() => setSelectedGoal(null)} />}
    </div>
  )
}
