'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronDown, Loader2 } from 'lucide-react'
import { createTransaction } from '@/actions/transactions'
import { CATEGORIES, PAYMENT_METHODS } from '@/lib/helpers'

interface AddTransactionModalProps {
  onClose: () => void
}

export function AddTransactionModal({ onClose }: AddTransactionModalProps) {
  const router = useRouter()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [paymentMethod, setPaymentMethod] = useState('')
  const [installments, setInstallments] = useState('1')
  const [notes, setNotes] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !category || !description) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createTransaction({
        amount: parseFloat(amount.replace(',', '.')),
        type,
        category,
        description,
        date: new Date(date + 'T12:00:00'),

        paymentMethod: paymentMethod || undefined,
        installments: parseInt(installments) || 1,
        notes: notes || undefined,
      })
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar transação')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa' }}>Nova Transação</h2>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: 'none',
              cursor: 'pointer', color: '#6b6b80',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          {/* Type toggle */}
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px', padding: '4px',
              marginBottom: '20px',
            }}
          >
            {(['EXPENSE', 'INCOME'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: type === t
                    ? t === 'INCOME' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'
                    : 'transparent',
                  color: type === t
                    ? t === 'INCOME' ? '#4ade80' : '#f87171'
                    : '#6b6b80',
                }}
              >
                {t === 'INCOME' ? '↑ Entrada' : '↓ Saída'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
              color: '#f87171', fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                Valor *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: '#6b6b80', fontSize: '15px', fontWeight: 600,
                }}>R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ paddingLeft: '44px', fontSize: '22px', fontWeight: 700, height: '56px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                Descrição *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: Supermercado, Salário..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                Categoria *
              </label>
              <select
                className="input-field"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Selecionar categoria</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value} style={{ background: '#16161f' }}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                Data *
              </label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', color: '#a0a0b0', fontSize: '13px', fontWeight: 500,
              }}
            >
              Campos avançados
              <ChevronDown
                size={16}
                style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            {showAdvanced && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                      Forma de pagamento
                    </label>
                    <select
                      className="input-field"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{ appearance: 'none', cursor: 'pointer' }}
                    >
                      <option value="">Selecionar</option>
                      {PAYMENT_METHODS.map(m => (
                        <option key={m.value} value={m.value} style={{ background: '#16161f' }}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                      Parcelas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      className="input-field"
                      value={installments}
                      onChange={e => setInstallments(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                    Observações
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Notas adicionais..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', marginTop: '4px', opacity: loading ? 0.8 : 1,
              }}
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar transação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
