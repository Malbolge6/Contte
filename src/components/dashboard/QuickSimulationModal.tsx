'use client'

import { useState } from 'react'
import { X, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency, CATEGORIES } from '@/lib/helpers'

interface Goal {
  id: string
  categoryId: string
  category: string
  limitAmount?: number | null
  currentAmount: number
}

interface QuickSimulationProps {
  currentTotalExpenses: number
  currentBalance: number
  categoryData: Record<string, number>
  goals: Goal[]
  onClose: () => void
}

export function QuickSimulationModal({
  currentTotalExpenses,
  currentBalance,
  categoryData,
  goals,
  onClose
}: QuickSimulationProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')

  const simulatedAmount = parseFloat(amount.replace(',', '.')) || 0

  const newTotalExpenses = currentTotalExpenses + simulatedAmount
  const expenseIncreasePercent = currentTotalExpenses > 0 
    ? ((newTotalExpenses - currentTotalExpenses) / currentTotalExpenses) * 100 
    : 0

  const newBalance = currentBalance - simulatedAmount

  const selectedGoal = goals?.find(g => g.category === category)
  let goalImpact = null

  if (selectedGoal && selectedGoal.limitAmount) {
    const currentCategorySpent = categoryData[category] || 0
    const newCategorySpent = currentCategorySpent + simulatedAmount
    const oldPercent = (currentCategorySpent / selectedGoal.limitAmount) * 100
    const newPercent = (newCategorySpent / selectedGoal.limitAmount) * 100

    goalImpact = {
      limit: selectedGoal.limitAmount,
      oldPercent,
      newPercent,
      isOver: newCategorySpent > selectedGoal.limitAmount
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content" style={{ background: '#0a0a0a' }}>
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '12px auto 0' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
              Simulação Rápida ⚡
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
              Veja o impacto antes de gastar
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
            border: 'none', cursor: 'pointer', color: '#a1a1aa', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0 24px 30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                Se eu comprar algo de:
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontSize: '18px', fontWeight: 600 }}>R$</span>
                <input
                  type="number" step="0.01" className="input-field" placeholder="0,00"
                  value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ paddingLeft: '50px', fontSize: '24px', fontWeight: 700, height: '64px', background: 'rgba(255,255,255,0.03)' }}
                  autoFocus
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>
                Na categoria:
              </label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ appearance: 'none', height: '54px', background: 'rgba(255,255,255,0.03)' }}>
                <option value="">Selecionar categoria</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: '#111' }}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Results Area */}
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(204, 255, 0, 0.05) 0%, rgba(204, 255, 0, 0) 100%)',
            border: '1px solid rgba(204, 255, 0, 0.1)',
            borderRadius: '20px', padding: '20px'
          }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ccff00', fontWeight: 700, marginBottom: '16px' }}>
              Impacto no seu mês
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Balance Impact */}
              <div>
                <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>Saldo Final</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', textDecoration: 'line-through' }}>
                    {formatCurrency(currentBalance)}
                  </span>
                  <span style={{ color: '#71717a' }}>→</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: newBalance < 0 ? '#f43f5e' : '#fff' }}>
                    {formatCurrency(newBalance)}
                  </span>
                </div>
              </div>

              {/* Total Expenses Impact */}
              <div>
                <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>Total de Gastos</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', textDecoration: 'line-through' }}>
                    {formatCurrency(currentTotalExpenses)}
                  </span>
                  <span style={{ color: '#71717a' }}>→</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                    {formatCurrency(newTotalExpenses)}
                  </span>
                  {simulatedAmount > 0 && (
                    <span style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      +{expenseIncreasePercent.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Goal Impact */}
              {category && goalImpact && (
                <div style={{ 
                  background: goalImpact.isOver ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${goalImpact.isOver ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                  padding: '16px', borderRadius: '16px', marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '13px', color: goalImpact.isOver ? '#f43f5e' : '#a1a1aa', fontWeight: 600 }}>
                      Meta: {CATEGORIES.find(c => c.value === category)?.label}
                    </p>
                    {goalImpact.isOver && <AlertTriangle size={14} color="#f43f5e" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#71717a' }}>
                      {goalImpact.oldPercent.toFixed(0)}%
                    </span>
                    <span style={{ color: '#71717a' }}>→</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: goalImpact.isOver ? '#f43f5e' : '#ccff00' }}>
                      {goalImpact.newPercent.toFixed(0)}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#71717a', marginLeft: 'auto' }}>
                      Limite: {formatCurrency(goalImpact.limit)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(goalImpact.newPercent, 100)}%`, 
                      background: goalImpact.isOver ? '#f43f5e' : '#ccff00',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  {goalImpact.isOver && (
                    <p style={{ fontSize: '12px', color: '#f43f5e', marginTop: '8px', fontWeight: 500 }}>
                      Atenção: Este gasto vai estourar sua meta!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
