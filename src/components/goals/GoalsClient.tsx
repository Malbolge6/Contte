'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Target, TrendingUp, Loader2, Trash2, Edit2 } from 'lucide-react'
import { formatCurrency, CATEGORIES } from '@/lib/helpers'
import { createGoal, deleteGoal, updateGoal } from '@/actions/goals'
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

interface GoalsClientProps {
  goals: Goal[]
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
        limitAmount: limitAmount ? parseFloat(limitAmount) : undefined,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
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
              <input type="text" className="input-field" placeholder="Ex: Não gastar mais com delivery" value={name} onChange={e => setName(e.target.value)} required />
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Limite (R$)</label>
                <input type="number" step="0.01" className="input-field" placeholder="Valor máximo" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Meta de economia (R$)</label>
                <input type="number" step="0.01" className="input-field" placeholder="Valor alvo" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Período</label>
              <select className="input-field" value={period} onChange={e => setPeriod(e.target.value)} style={{ appearance: 'none' }}>
                <option value="monthly" style={{ background: '#16161f' }}>Mensal</option>
                <option value="yearly" style={{ background: '#16161f' }}>Anual</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', opacity: loading ? 0.8 : 1 }}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              Criar meta
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function GoalsClient({ goals }: GoalsClientProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
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
    <div className="fade-in" style={{ paddingTop: '8px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.5px' }}>
            Metas Financeiras
          </h1>
          <p style={{ color: '#6b6b80', fontSize: '13px', marginTop: '4px' }}>
            Controle limites e objetivos de economia
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Plus size={20} />
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</p>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8f9fa', marginBottom: '8px' }}>
            Defina suas metas
          </h3>
          <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '20px' }}>
            Crie limites por categoria ou metas de economia
          </p>
          <button className="btn-accent" onClick={() => setShowAdd(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Criar primeira meta
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map(goal => {
            const cat = CATEGORIES.find(c => c.value === goal.category)
            const max = goal.type === 'LIMIT' ? goal.limitAmount : goal.targetAmount
            const progress = max && max > 0 ? Math.min((goal.currentAmount / max) * 100, 100) : 0
            const isOverLimit = goal.type === 'LIMIT' && max && goal.currentAmount > max
            const isComplete = goal.type === 'SAVINGS' && max && goal.currentAmount >= max

            return (
              <div key={goal.id} className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: goal.type === 'LIMIT' ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    }}>
                      {cat?.icon || (goal.type === 'LIMIT' ? '🚫' : '🎯')}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8f9fa' }}>{goal.name}</h3>
                      <p style={{ fontSize: '12px', color: '#6b6b80', marginTop: '2px' }}>
                        {goal.type === 'LIMIT' ? 'Limite' : 'Meta de economia'} · {goal.period === 'monthly' ? 'Mensal' : 'Anual'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isComplete && <span style={{ fontSize: '18px' }}>🏆</span>}
                    {isOverLimit && <span style={{ fontSize: '18px' }}>⚠️</span>}
                    <button
                      onClick={() => handleDelete(goal.id)}
                      disabled={deletingId === goal.id}
                      style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.08)', border: 'none',
                        cursor: 'pointer', color: '#6b6b80',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {deletingId === goal.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>

                {max && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#a0a0b0' }}>
                        {formatCurrency(goal.currentAmount)} de {formatCurrency(max)}
                      </span>
                      <span style={{
                        fontSize: '13px', fontWeight: 700,
                        color: isOverLimit ? '#f87171' : isComplete ? '#4ade80' : '#ccff00',
                      }}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: isOverLimit
                            ? 'linear-gradient(90deg, #f87171, #ef4444)'
                            : isComplete
                              ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                              : undefined,
                        }}
                      />
                    </div>
                    {isOverLimit && (
                      <p style={{ fontSize: '12px', color: '#f87171', marginTop: '8px' }}>
                        Limite excedido por {formatCurrency(goal.currentAmount - max)}
                      </p>
                    )}
                    {isComplete && (
                      <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '8px' }}>
                        Meta atingida! Parabéns! 🎉
                      </p>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}



      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
