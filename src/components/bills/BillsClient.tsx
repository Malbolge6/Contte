'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Copy, CheckCircle, Clock, AlertCircle,
  X, ChevronDown, Loader2, Trash2, Edit2,
  QrCode, Barcode, FileText, Wallet, ChevronRight, Check
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES, maskCurrency, parseCurrency } from '@/lib/helpers'
import { markBillAsPaid, unmarkBillAsPaid, deleteBill, createBill } from '@/actions/bills'
import { getWallets } from '@/actions/wallets'
import { createPortal } from 'react-dom'

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

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount || !dueDate) {
      setError('Preencha os campos obrigatórios')
      return
    }
    setLoading(true)
    try {
      await createBill({
        name,
        amount: parseCurrency(amount),
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', maxHeight: 'calc(100vh - 32px)', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Nova Conta</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>NOME DA CONTA</label>
            <input type="text" className="input-field" placeholder="Ex: Aluguel, Internet..." value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>VALOR</label>
              <input type="text" className="input-field" placeholder="R$ 0,00" value={amount} onChange={e => setAmount(maskCurrency(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#71717a', marginBottom: '8px', textTransform: 'uppercase' }}>VENCIMENTO</label>
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
          <button type="submit" className="btn-primary" disabled={loading} style={{ height: '56px', marginTop: '16px' }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Criar Conta'}
          </button>
        </form>
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
  const [wallets, setWallets] = useState<any[]>([])
  const [showWalletSelector, setShowWalletSelector] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showAntonioBio, setShowAntonioBio] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getWallets().then(setWallets).catch(console.error)
  }, [])

  if (!mounted) return null

  const bills = Array.isArray(rawBills) ? rawBills.filter(b => b && typeof b === 'object') : []
  const filtered = bills.filter(b => activeTab === 'PENDING' ? b.status === 'PENDING' : b.status === 'PAID')

  const totalPending = bills
    .filter(b => b.status === 'PENDING')
    .reduce((s, b) => s + (b.amount || 0), 0)

  async function handleMarkPaid(id: string, walletId?: string) {
    setMarkingPaid(id)
    try {
      await markBillAsPaid(id, walletId)
      router.refresh()
      setShowWalletSelector(null)
    } finally {
      setMarkingPaid(null)
    }
  }

  async function handleUnmarkPaid(id: string) {
    if (!confirm('Reverter para pendente?')) return
    setMarkingPaid(id)
    try {
      await unmarkBillAsPaid(id)
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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 8px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' }}>Compromissos</h1>
          <p style={{ color: '#71717a', fontSize: '14px', fontWeight: 500 }}>Controle suas saídas e mantenha o fluxo</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setShowAntonioBio(!showAntonioBio)}
              style={{ 
                width: '74px', height: '74px', borderRadius: '18px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative', boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>ANTONIO</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/antonio.png" alt="Antonio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {showAntonioBio && (
              <div className="scale-in" style={{
                position: 'absolute', top: '100%', right: '0', width: '240px',
                background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
                marginTop: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <strong>Olá, sou o Antonio!</strong> 🦦👔<br/><br/>
                  Sou o líder da Contte. Minha missão é organizar sua vida financeira e garantir que seu caixa esteja sempre saudável e sob controle!
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/carteiras')} style={{ height: '48px', padding: '0 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <Wallet size={18} /> Carteiras
            </button>
            <button onClick={() => setShowAddModal(true)} style={{ height: '48px', width: '48px', borderRadius: '16px', background: '#ccff00', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', padding: '0 8px' }}>
        {(['PENDING', 'PAID'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '13px', transition: 'all 0.2s',
              background: activeTab === tab ? '#ccff00' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab ? '#000' : '#71717a',
            }}
          >
            {tab === 'PENDING' ? 'Pendentes' : 'Pagas'}
          </button>
        ))}
      </div>

      {/* Bills list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(bill => {
          const days = getDaysUntilDue(bill.dueDate)
          const isOverdue = days < 0 && bill.status === 'PENDING'
          const cat = CATEGORIES.find(c => c.value === bill.category)

          return (
            <div
              key={bill.id}
              style={{
                padding: '20px', borderRadius: '24px',
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.04)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {isOverdue && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f43f5e' }} />}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {cat?.icon || '📦'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{bill.name}</h3>
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
                    <button onClick={() => handleDelete(bill.id)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                    <button 
                      onClick={() => setShowWalletSelector(bill.id)} 
                      style={{ height: '44px', padding: '0 20px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <CheckCircle size={18} /> Pagar
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => handleDelete(bill.id)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                    <button onClick={() => handleUnmarkPaid(bill.id)} style={{ height: '44px', padding: '0 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Reverter</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Wallet Selector Modal */}
      {showWalletSelector && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowWalletSelector(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>De onde sairá o dinheiro?</h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>Selecione a carteira para realizar o pagamento.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {wallets.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleMarkPaid(showWalletSelector, w.id)}
                  style={{
                    padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${w.color || '#ccff00'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{w.type === 'bank' ? '🏦' : '📱'}</div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{w.name}</span>
                  </div>
                  <span style={{ color: '#ccff00', fontWeight: 800 }}>{formatCurrency(w.balance)}</span>
                </button>
              ))}
              <button
                onClick={() => handleMarkPaid(showWalletSelector)}
                style={{ padding: '16px', borderRadius: '18px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', color: '#71717a', fontSize: '13px', cursor: 'pointer' }}
              >
                Pagar sem descontar de carteira
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showAddModal && <AddBillModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
