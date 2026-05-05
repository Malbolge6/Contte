'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Pencil, Trash2, Loader2, Wallet, CreditCard, Banknote, PiggyBank } from 'lucide-react'
import { createWallet, updateWallet, deleteWallet } from '@/actions/wallets'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

interface WalletItem {
  id: string
  name: string
  type: string
  balance: number
  color?: string | null
  icon?: string | null
}

interface WalletsClientProps {
  wallets: WalletItem[]
}

const WALLET_TYPES = [
  { value: 'bank', label: 'Conta Bancária', icon: '🏦' },
  { value: 'digital', label: 'Carteira Digital', icon: '📱' },
  { value: 'va', label: 'Vale Alimentação (VA)', icon: '🍽️' },
  { value: 'vr', label: 'Vale Refeição (VR)', icon: '🍱' },
  { value: 'cash', label: 'Dinheiro em Espécie', icon: '💵' },
  { value: 'investment', label: 'Investimento', icon: '📈' },
]

const WALLET_COLORS = ['#ccff00', '#34d399', '#38bdf8', '#c084fc', '#f472b6', '#fb923c', '#facc15']

function getWalletIcon(type: string) {
  return WALLET_TYPES.find(t => t.value === type)?.icon || '💳'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function WalletsClient({ wallets: initialWallets }: WalletsClientProps) {
  const router = useRouter()
  const [wallets, setWallets] = useState(initialWallets)
  const [showAdd, setShowAdd] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState('#ccff00')

  // Adjustment state
  const [adjustingWallet, setAdjustingWallet] = useState<WalletItem | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustType, setAdjustType] = useState<'ADD' | 'SUB'>('ADD')

  useEffect(() => { setMounted(true) }, [])

  function openAdd() {
    setName(''); setType('bank'); setBalance(''); setColor('#ccff00')
    setEditingWallet(null)
    setShowAdd(true)
  }

  function openEdit(w: WalletItem) {
    setName(w.name)
    setType(w.type)
    setBalance(String(w.balance))
    setColor(w.color || '#ccff00')
    setEditingWallet(w)
    setShowAdd(true)
  }

  function openAdjust(w: WalletItem, type: 'ADD' | 'SUB') {
    setAdjustingWallet(w)
    setAdjustType(type)
    setAdjustAmount('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { name, type, balance: parseFloat(balance.replace(',', '.')) || 0, color }
      if (editingWallet) {
        await updateWallet(editingWallet.id, data)
      } else {
        await createWallet(data)
      }
      setShowAdd(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault()
    if (!adjustingWallet) return
    setLoading(true)
    try {
      const amount = parseFloat(adjustAmount.replace(',', '.')) || 0
      const newBalance = adjustType === 'ADD' 
        ? adjustingWallet.balance + amount 
        : adjustingWallet.balance - amount
      
      await updateWallet(adjustingWallet.id, { balance: newBalance })
      setAdjustingWallet(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta carteira? Todos os registros vinculados a ela serão mantidos, mas a carteira sumirá. Continuar?')) return
    setDeletingId(id)
    try {
      await deleteWallet(id)
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const totalBalance = initialWallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Carteiras
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
            Seus saldos em um só lugar
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Wallets List */}
      {initialWallets.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Nenhuma carteira ainda
          </h3>
          <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px' }}>
            Adicione suas contas bancárias, VA, VR, PicPay e mais
          </p>
          <button onClick={openAdd} className="btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Adicionar primeira carteira
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {initialWallets.map((wallet) => (
            <div key={wallet.id} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Icon */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '16px',
                background: `${wallet.color || '#ccff00'}20`,
                border: `1.5px solid ${wallet.color || '#ccff00'}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0,
              }}>
                {getWalletIcon(wallet.type)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8f9fa' }}>{wallet.name}</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: wallet.balance >= 0 ? (wallet.color || '#ccff00') : '#f87171', marginTop: '2px' }}>
                  {formatCurrency(wallet.balance)}
                </p>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => openAdjust(wallet, 'ADD')}
                  title="Somar ao saldo"
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(204, 255, 0, 0.1)', border: 'none', color: '#ccff00', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => openEdit(wallet)}
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  disabled={deletingId === wallet.id}
                  style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {deletingId === wallet.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjustment Modal */}
      {adjustingWallet && mounted && createPortal(
        <div className="modal-overlay" onClick={() => setAdjustingWallet(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa' }}>
                Ajustar Saldo
              </h2>
              <button onClick={() => setAdjustingWallet(null)} style={{ background: 'none', border: 'none', color: '#71717a' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAdjust} style={{ padding: '0 20px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ fontSize: '14px', color: '#a1a1aa' }}>
                Carteira: <strong>{adjustingWallet.name}</strong> (Atual: {formatCurrency(adjustingWallet.balance)})
              </p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setAdjustType('ADD')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: adjustType === 'ADD' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)', border: adjustType === 'ADD' ? '1px solid #ccff00' : '1px solid rgba(255,255,255,0.05)', color: adjustType === 'ADD' ? '#ccff00' : '#71717a', fontSize: '13px', fontWeight: 700 }}>SOMAR (+)</button>
                <button type="button" onClick={() => setAdjustType('SUB')} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: adjustType === 'SUB' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(255,255,255,0.02)', border: adjustType === 'SUB' ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.05)', color: adjustType === 'SUB' ? '#f87171' : '#71717a', fontSize: '13px', fontWeight: 700 }}>SUBTRAIR (-)</button>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontWeight: 700 }}>R$</span>
                <input 
                  type="number" step="0.01" autoFocus required
                  placeholder="0,00"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '24px', fontWeight: 800 }}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                style={{ height: '56px', borderRadius: '16px', background: '#ccff00', color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Processando...' : 'Confirmar Ajuste'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Modal */}
      {showAdd && mounted && createPortal(
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa' }}>
                {editingWallet ? 'Editar Carteira' : 'Nova Carteira'}
              </h2>
              <button onClick={() => setShowAdd(false)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#6b6b80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '0 20px 80px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                    Nome *
                  </label>
                  <input
                    type="text" className="input-field" autoFocus required
                    placeholder="Ex: Bradesco, PicPay, VA Ifood..."
                    value={name} onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                    Tipo
                  </label>
                  <select className="input-field" value={type} onChange={e => setType(e.target.value)} style={{ appearance: 'none' }}>
                    {WALLET_TYPES.map(t => (
                      <option key={t.value} value={t.value} style={{ background: '#16161f' }}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Balance */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '6px' }}>
                    Saldo Atual (R$) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', fontWeight: 600 }}>R$</span>
                    <input
                      type="number" step="0.01" className="input-field" required
                      placeholder="0,00"
                      value={balance} onChange={e => setBalance(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a0a0b0', marginBottom: '10px' }}>
                    Cor
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {WALLET_COLORS.map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => setColor(c)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: c,
                          border: color === c ? '3px solid white' : '3px solid transparent',
                          cursor: 'pointer', transition: 'border 0.15s',
                          outline: color === c ? '2px solid rgba(255,255,255,0.4)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', opacity: loading ? 0.8 : 1 }}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {editingWallet ? 'Salvar alterações' : 'Criar carteira'}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
