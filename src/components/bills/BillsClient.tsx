'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Copy, CheckCircle, Clock, AlertCircle,
  X, ChevronDown, Loader2, Trash2, Edit2,
  QrCode, Barcode, FileText
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES } from '@/lib/helpers'
import { markBillAsPaid, deleteBill, createBill } from '@/actions/bills'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string | Date
  description?: string | null
  pixKey?: string | null
  barcode?: string | null
  status: string

  category?: string | null
  recurrent: boolean
  paidAt?: string | Date | null
}

interface BillsClientProps {
  bills: Bill[]
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        border: '1px solid',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '13px',
        transition: 'all 0.2s',
        borderColor: copied ? 'rgba(74,222,128,0.3)' : 'rgba(204, 255, 0, 0.3)',
        background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(204, 255, 0, 0.08)',
        color: copied ? '#4ade80' : '#ccff00',
      }}
    >
      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
      {copied ? 'Copiado!' : label}
    </button>
  )
}

function AddBillModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [barcode, setBarcode] = useState('')

  const [category, setCategory] = useState('')
  const [recurrent, setRecurrent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount || !dueDate) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createBill({
        name,
        amount: parseFloat(amount.replace(',', '.')),
        dueDate: new Date(dueDate + 'T12:00:00'),
        description: description || undefined,
        pixKey: pixKey || undefined,
        barcode: barcode || undefined,

        category: category || undefined,
        recurrent,
      })
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta')
      setLoading(false)
    }
  }

  if (!mounted) return null
  return createPortal(
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content">
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa' }}>Nova Conta</h2>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#6b6b80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '0 20px 80px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Nome da conta *</label>
              <input type="text" className="input-field" placeholder="Ex: Aluguel, Internet..." value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Valor *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', fontSize: '14px', fontWeight: 600 }}>R$</span>
                  <input type="number" step="0.01" min="0" className="input-field" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} style={{ paddingLeft: '36px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Vencimento *</label>
                <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Categoria</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Selecionar</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value} style={{ background: '#16161f' }}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><QrCode size={13} /> Chave PIX</span>
              </label>
              <input type="text" className="input-field" placeholder="Chave PIX (opcional)" value={pixKey} onChange={e => setPixKey(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Barcode size={13} /> Código de barras</span>
              </label>
              <input type="text" className="input-field" placeholder="Código de barras (opcional)" value={barcode} onChange={e => setBarcode(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>Descrição</label>
              <input type="text" className="input-field" placeholder="Observação (opcional)" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '14px', color: '#a0a0b0', fontWeight: 500 }}>Recorrente (mensal)</span>
              <button type="button" onClick={() => setRecurrent(!recurrent)} style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: recurrent ? 'linear-gradient(135deg, #ccff00, #99cc00)' : 'rgba(255,255,255,0.1)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s', left: recurrent ? '23px' : '3px',
                }} />
              </button>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', opacity: loading ? 0.8 : 1 }}>
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Salvando...' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function BillsClient({ bills: rawBills }: BillsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID'>('PENDING')
  const [showAddModal, setShowAddModal] = useState(false)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Mega safety check
  const bills = Array.isArray(rawBills) ? rawBills.filter(b => b && typeof b === 'object') : []

  const filtered = bills.filter(b => {
    try {
      if (activeTab === 'PENDING') return b.status === 'PENDING'
      return b.status === 'PAID'
    } catch {
      return false
    }
  })

  const totalPending = bills
    .filter(b => b && b.status === 'PENDING' && typeof b.amount === 'number')
    .reduce((s, b) => s + (b.amount || 0), 0)

  const overdue = bills.filter(b => 
    b && b.status === 'PENDING' && getDaysUntilDue(b.dueDate) < 0
  )

  async function handleMarkPaid(id: string) {
    setMarkingPaid(id)
    try {
      await markBillAsPaid(id)
      router.refresh()
    } finally {
      setMarkingPaid(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta?')) return
    setDeletingId(id)
    try {
      await deleteBill(id)
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>
            Contas a Pagar
          </h1>
          <p style={{ color: '#71717a', fontSize: '13px', fontWeight: 500 }}>
            Gerencie e pague suas faturas rapidamente
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => router.push('/documentos')}
            style={{ 
              height: '44px', width: '44px', borderRadius: '14px', 
              background: 'rgba(255, 255, 255, 0.05)', color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Meus Comprovantes"
          >
            <FileText size={20} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            style={{ 
              height: '44px', width: '44px', borderRadius: '14px', 
              background: 'rgba(204, 255, 0, 0.15)', color: '#ccff00', 
              border: '1px solid rgba(204, 255, 0, 0.3)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(204, 255, 0, 0.1)'
            }}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Summary Cards - Bento Style */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={12} color="#ccff00" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>A PAGAR</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
            {formatCurrency(totalPending)}
          </p>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            {bills.filter(b => b.status === 'PENDING').length} boletos
          </p>
        </div>
        
        <div className="glass-card" style={{ 
          padding: '24px', 
          background: overdue.length > 0 ? 'rgba(244, 63, 94, 0.05)' : 'rgba(255,255,255,0.02)',
          border: overdue.length > 0 ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: overdue.length > 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={12} color={overdue.length > 0 ? '#f43f5e' : '#71717a'} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VENCIDOS</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 900, color: overdue.length > 0 ? '#f43f5e' : '#fff' }}>
            {overdue.length}
          </p>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            {overdue.length > 0 ? 'Exige atenção' : 'Tudo em dia'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
        {(['PENDING', 'PAID'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(204, 255, 0, 0.15)' : 'transparent',
              color: activeTab === tab ? '#ccff00' : '#6b6b80',
            }}
          >
            {tab === 'PENDING' ? '⏳ Pendentes' : '✅ Pagas'}
          </button>
        ))}
      </div>

      {/* Bills list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>
            {activeTab === 'PENDING' ? '🎉' : '📋'}
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#f8f9fa', marginBottom: '8px' }}>
            {activeTab === 'PENDING' ? 'Nenhuma conta pendente!' : 'Nenhuma conta paga ainda'}
          </p>
          <p style={{ fontSize: '13px', color: '#6b6b80' }}>
            {activeTab === 'PENDING' ? 'Tudo em dia 🎉' : 'As contas pagas aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(bill => {
            const days = getDaysUntilDue(bill.dueDate)
            const isOverdue = days < 0 && bill.status === 'PENDING'
            const isUrgent = days >= 0 && days <= 3 && bill.status === 'PENDING'
            const cat = CATEGORIES.find(c => c.value === bill.category)

            return (
              <div
                key={bill.id}
                className="card"
                style={{
                  padding: '16px',
                  borderColor: isOverdue ? 'rgba(239,68,68,0.2)' : isUrgent ? 'rgba(204, 255, 0, 0.2)' : undefined,
                  background: isOverdue ? 'rgba(239,68,68,0.04)' : isUrgent ? 'rgba(204, 255, 0, 0.04)' : undefined,
                }}
              >
                {/* Bill header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{cat?.icon || '💳'}</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8f9fa' }}>{bill.name}</h3>
                      {isOverdue && <span className="badge-overdue">Vencida</span>}
                      {isUrgent && !isOverdue && <span className="badge-pending">Urgente</span>}
                      {bill.status === 'PAID' && <span className="badge-paid">Paga</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: isOverdue ? '#f87171' : isUrgent ? '#ccff00' : '#6b6b80' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        {bill.status === 'PAID'
                          ? `Pago em ${formatDate(bill.paidAt!)}`
                          : isOverdue
                            ? `Vencida há ${Math.abs(days)} dia(s)`
                            : days === 0
                              ? 'Vence hoje!'
                              : `Vence ${formatDate(bill.dueDate)}`
                        }
                      </span>

                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#f8f9fa' }}>
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>

                {bill.description && (
                  <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '12px' }}>{bill.description}</p>
                )}

                {/* Action buttons */}
                {bill.status === 'PENDING' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    {bill.pixKey && (
                      <CopyButton text={bill.pixKey} label="Copiar PIX" />
                    )}
                    {bill.barcode && (
                      <CopyButton text={bill.barcode} label="Copiar boleto" />
                    )}
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={() => handleDelete(bill.id)}
                      disabled={deletingId === bill.id}
                      style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                        cursor: 'pointer', color: '#f87171',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {deletingId === bill.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                    <button
                      onClick={() => handleMarkPaid(bill.id)}
                      disabled={markingPaid === bill.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.15))',
                        border: '1px solid rgba(74,222,128,0.25)',
                        cursor: 'pointer', color: '#4ade80',
                        fontWeight: 600, fontSize: '13px',
                      }}
                    >
                      {markingPaid === bill.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle size={14} />
                      }
                      {markingPaid === bill.id ? 'Marcando...' : 'Marcar como pago'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}



      {showAddModal && <AddBillModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
