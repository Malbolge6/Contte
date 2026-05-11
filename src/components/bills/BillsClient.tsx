'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Copy, CheckCircle, X, Loader2, Trash2,
  Edit2, QrCode, Barcode, Wallet, RefreshCw, Check
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES, maskCurrency, parseCurrency } from '@/lib/helpers'
import { markBillAsPaid, unmarkBillAsPaid, deleteBill, createBill, updateBill } from '@/actions/bills'
import { getWallets } from '@/actions/wallets'
import { createPortal } from 'react-dom'

const fmt = (v: number) => formatCurrency(v)

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
    <button onClick={handleCopy} style={{
      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
      borderRadius: '8px', border: '1px solid',
      cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s',
      borderColor: copied ? 'rgba(74,222,128,0.3)' : 'rgba(204, 255, 0, 0.3)',
      background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(204, 255, 0, 0.08)',
      color: copied ? '#4ade80' : '#ccff00',
    }}>
      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
      {copied ? 'Copiado!' : label}
    </button>
  )
}

function BillModal({ bill, onClose }: { bill?: Bill | null; onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState(bill?.name || '')
  const [amount, setAmount] = useState(bill ? String(bill.amount) : '')
  const [dueDate, setDueDate] = useState(
    bill?.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [description, setDescription] = useState(bill?.description || '')
  const [pixKey, setPixKey] = useState(bill?.pixKey || '')
  const [barcode, setBarcode] = useState(bill?.barcode || '')
  const [category, setCategory] = useState(bill?.category || '')
  const [recurrent, setRecurrent] = useState(bill?.recurrent || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount || !dueDate) { setError('Preencha os campos obrigatórios'); return }
    setLoading(true)
    try {
      const data = {
        name, amount: parseCurrency(amount),
        dueDate: new Date(dueDate + 'T12:00:00'),
        description: description || undefined,
        pixKey: pixKey || undefined,
        barcode: barcode || undefined,
        category: category || undefined,
        recurrent,
      }
      if (bill) {
        await updateBill(bill.id, data)
      } else {
        await createBill(data)
      }
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar conta')
      setLoading(false)
    }
  }

  if (!mounted) return null
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', maxHeight: 'calc(100vh - 32px)', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', overflowY: 'auto', position: 'relative' }}>
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{bill ? 'Editar Conta' : 'Nova Conta'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px', color: '#f87171', fontSize: '13px' }}>{error}</div>}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>NOME DA CONTA *</label>
            <input type="text" className="input-field" placeholder="Ex: Aluguel, Internet..." value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>VALOR *</label>
              <input type="text" className="input-field" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(maskCurrency(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>VENCIMENTO *</label>
              <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>CATEGORIA</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Selecionar</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>CHAVE PIX (opcional)</label>
            <input type="text" className="input-field" placeholder="Chave PIX para copiar" value={pixKey} onChange={e => setPixKey(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>CÓDIGO DE BARRAS (opcional)</label>
            <input type="text" className="input-field" placeholder="Código do boleto" value={barcode} onChange={e => setBarcode(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>OBSERVAÇÃO</label>
            <input type="text" className="input-field" placeholder="Notas adicionais..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {/* Recurrent Toggle */}
          <button type="button" onClick={() => setRecurrent(!recurrent)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '16px',
            background: recurrent ? 'rgba(204, 255, 0, 0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${recurrent ? 'rgba(204, 255, 0, 0.3)' : 'rgba(255,255,255,0.08)'}`,
            cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={18} color={recurrent ? '#ccff00' : '#71717a'} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: recurrent ? '#ccff00' : '#fff' }}>Conta Recorrente</p>
                <p style={{ fontSize: '12px', color: '#71717a' }}>Aparece todo mês automaticamente</p>
              </div>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: recurrent ? '#ccff00' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ position: 'absolute', top: '3px', left: recurrent ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: recurrent ? '#000' : '#666', transition: 'all 0.2s' }} />
            </div>
          </button>
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '56px', marginTop: '8px' }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : (bill ? 'Salvar Alterações' : 'Criar Conta')}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}

export function BillsClient({ bills: rawBills }: BillsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'PENDING' | 'PAID' | 'RECURRENT'>('PENDING')
  const [showModal, setShowModal] = useState(false)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)
  const [payingWalletId, setPayingWalletId] = useState<string | null>(null)
  const [wallets, setWallets] = useState<any[]>([])
  const [showWalletSelector, setShowWalletSelector] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getWallets().then(setWallets).catch(console.error)
  }, [])

  if (!mounted) return null

  const bills = Array.isArray(rawBills) ? rawBills.filter(b => b && typeof b === 'object') : []
  // Separate clearly: recurrent bills always go to RECURRENT tab; regular pending go to PENDING
  const pendingBills = bills.filter(b => b.status === 'PENDING' && !b.recurrent)
  const paidBills = bills.filter(b => b.status === 'PAID')
  const recurrentBills = bills.filter(b => b.recurrent && b.status === 'PENDING')

  const filtered = activeTab === 'PENDING' ? pendingBills
    : activeTab === 'PAID' ? paidBills
    : recurrentBills

  const totalPending = pendingBills.reduce((s, b) => s + (b.amount || 0), 0)
  const totalRecurrent = recurrentBills.reduce((s, b) => s + (b.amount || 0), 0)

  async function handleMarkPaid(id: string, walletId?: string) {
    setMarkingPaid(id)
    setPayingWalletId(walletId || null)
    try {
      await markBillAsPaid(id, walletId)
      router.refresh()
      setShowWalletSelector(null)
    } catch (err: any) {
      alert('Erro ao pagar conta: ' + (err.message || 'Tente novamente'))
    } finally {
      setMarkingPaid(null)
      setPayingWalletId(null)
    }
  }

  async function handleUnmarkPaid(id: string) {
    if (!confirm('Reverter para pendente?')) return
    setMarkingPaid(id)
    try { await unmarkBillAsPaid(id); router.refresh() }
    finally { setMarkingPaid(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta conta?')) return
    setDeletingId(id)
    try { await deleteBill(id); router.refresh() }
    finally { setDeletingId(null) }
  }

  function openEdit(bill: Bill) {
    setEditingBill(bill)
    setShowModal(true)
  }

  function openAdd() {
    setEditingBill(null)
    setShowModal(true)
  }

  return (
    <div className="fade-in" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 8px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>Compromissos</h1>
          <p style={{ color: '#71717a', fontSize: '14px', fontWeight: 500 }}>Controle suas saídas e mantenha o fluxo</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/carteiras')} style={{ height: '48px', padding: '0 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <Wallet size={18} /> Carteiras
          </button>
          <button onClick={openAdd} style={{ height: '48px', width: '48px', borderRadius: '16px', background: '#ccff00', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '0 8px' }}>
        <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 700, textTransform: 'uppercase' }}>A Pagar</p>
          <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{formatCurrency(totalPending)}</p>
          <p style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{pendingBills.length} conta(s)</p>
        </div>
        <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(204,255,0,0.06)', border: '1px solid rgba(204,255,0,0.15)' }}>
          <p style={{ fontSize: '11px', color: '#ccff00', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={11} /> Recorrentes</p>
          <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{formatCurrency(totalRecurrent)}</p>
          <p style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{recurrentBills.length} conta(s)/mês</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '0 8px' }}>
        {(['PENDING', 'PAID', 'RECURRENT'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 18px', borderRadius: '14px', border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: '13px', transition: 'all 0.2s',
            background: activeTab === tab ? '#ccff00' : 'rgba(255,255,255,0.05)',
            color: activeTab === tab ? '#000' : '#71717a',
          }}>
            {tab === 'PENDING' ? `Pendentes (${pendingBills.length})` : tab === 'PAID' ? `Pagas (${paidBills.length})` : `Recorrentes (${recurrentBills.length})`}
          </button>
        ))}
      </div>

      {/* Bills list */}
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>
            {activeTab === 'PAID' ? '✅' : activeTab === 'RECURRENT' ? '🔄' : '📋'}
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            {activeTab === 'PAID' ? 'Nenhuma conta paga ainda' : activeTab === 'RECURRENT' ? 'Nenhuma conta recorrente' : 'Nenhuma conta pendente'}
          </p>
          <p style={{ fontSize: '13px', color: '#71717a' }}>
            {activeTab === 'RECURRENT' ? 'Ao criar uma conta, marque-a como recorrente.' : 'Clique no + para adicionar uma nova conta.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(bill => {
            const days = getDaysUntilDue(bill.dueDate)
            const isOverdue = days < 0 && bill.status === 'PENDING'
            const cat = CATEGORIES.find(c => c.value === bill.category)
            return (
              <div key={bill.id} style={{ padding: '20px', borderRadius: '24px', background: '#111111', border: '1px solid rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
                {isOverdue && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f43f5e' }} />}
                {bill.recurrent && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ccff00' }} />}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {bill.recurrent ? '🔄' : (cat?.icon || '📦')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>{bill.name}</h3>
                        {bill.recurrent && <span style={{ fontSize: '10px', fontWeight: 800, color: '#ccff00', background: 'rgba(204,255,0,0.1)', padding: '2px 6px', borderRadius: '6px' }}>RECORRENTE</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: isOverdue ? '#f43f5e' : '#71717a', fontWeight: 600 }}>
                        {bill.status === 'PAID' ? `Pago em ${formatDate(bill.paidAt!)}` : isOverdue ? `Vencido há ${Math.abs(days)} dias` : `Vence em ${days} dias (${formatDate(bill.dueDate)})`}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{formatCurrency(bill.amount)}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {bill.status === 'PENDING' ? (
                    <>
                      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        {bill.pixKey && <CopyButton text={bill.pixKey} label="PIX" />}
                        {bill.barcode && <CopyButton text={bill.barcode} label="Boleto" />}
                      </div>
                      <button onClick={() => openEdit(bill)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(bill.id)} disabled={deletingId === bill.id} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {deletingId === bill.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                      <button onClick={() => setShowWalletSelector(bill.id)} style={{ height: '44px', padding: '0 20px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} /> Pagar
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => openEdit(bill)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(bill.id)} disabled={deletingId === bill.id} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {deletingId === bill.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                      <button onClick={() => handleUnmarkPaid(bill.id)} style={{ height: '44px', padding: '0 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Reverter</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Wallet Selector Modal */}
      {showWalletSelector && mounted && createPortal(
        <div
          onClick={() => { if (!markingPaid) setShowWalletSelector(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              maxHeight: '80vh',
              overflowY: 'auto',
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '28px',
              padding: '28px 24px 28px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>De onde sai o dinheiro?</h3>
              <button
                onClick={() => setShowWalletSelector(null)}
                disabled={!!markingPaid}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>Selecione a carteira para descontar o valor automaticamente.</p>

            {wallets.length === 0 ? (
              <p style={{ color: '#71717a', textAlign: 'center', padding: '16px 0' }}>
                Nenhuma carteira cadastrada.<br />Adicione em <strong style={{ color: '#ccff00' }}>Carteiras</strong>.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {wallets.map(w => {
                  const isLoading = markingPaid === showWalletSelector && payingWalletId === w.id
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleMarkPaid(showWalletSelector, w.id)}
                      disabled={!!markingPaid}
                      style={{
                        width: '100%', padding: '14px 18px', borderRadius: '18px',
                        background: isLoading ? 'rgba(204,255,0,0.06)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isLoading ? 'rgba(204,255,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: markingPaid ? 'not-allowed' : 'pointer',
                        opacity: markingPaid && !isLoading ? 0.45 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: `${w.color || '#ccff00'}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>
                          {w.type === 'bank' ? '🏦' : w.type === 'digital' ? '📱' : w.type === 'cash' ? '💵' : '💳'}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{w.name}</p>
                          <p style={{ color: w.balance < 0 ? '#f87171' : '#71717a', fontSize: '12px' }}>
                            Saldo: <strong>{fmt(w.balance)}</strong>
                          </p>
                        </div>
                      </div>
                      {isLoading
                        ? <Loader2 size={20} className="animate-spin" color="#ccff00" />
                        : <Check size={18} color="#ccff00" />
                      }
                    </button>
                  )
                })}
              </div>
            )}

            <button
              onClick={() => handleMarkPaid(showWalletSelector!)}
              disabled={!!markingPaid}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px',
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.15)',
                color: markingPaid === showWalletSelector && payingWalletId === null ? '#ccff00' : '#71717a',
                fontSize: '13px', fontWeight: 600,
                cursor: markingPaid ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {markingPaid === showWalletSelector && payingWalletId === null
                ? <Loader2 size={16} className="animate-spin" />
                : <CheckCircle size={16} />
              }
              Marcar como pago (sem descontar saldo)
            </button>
          </div>
        </div>,
        document.body
      )}

      {showModal && <BillModal bill={editingBill} onClose={() => { setShowModal(false); setEditingBill(null) }} />}
    </div>
  )
}
