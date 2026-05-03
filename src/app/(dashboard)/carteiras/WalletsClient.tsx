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

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta carteira?')) return
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

      {/* Total Balance Card */}
      {initialWallets.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #a3e635 0%, #bef264 50%, #fde047 100%)',
          borderRadius: '24px', padding: '24px', marginBottom: '24px',
          boxShadow: '0 12px 40px rgba(204, 255, 0, 0.15)',
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#111', opacity: 0.7, marginBottom: '6px' }}>
            Saldo Total em Carteiras
          </p>
          <p style={{ fontSize: '38px', fontWeight: 900, color: '#111', letterSpacing: '-1px' }}>
            {formatCurrency(totalBalance)}
          </p>
          <p style={{ fontSize: '13px', color: '#333', marginTop: '8px', opacity: 0.7 }}>
            {initialWallets.length} carteira(s) cadastrada(s)
          </p>
        </div>
      )}

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
            <div key={wallet.id} className="card" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: `${wallet.color || '#ccff00'}20`,
                border: `1.5px solid ${wallet.color || '#ccff00'}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0,
              }}>
                {getWalletIcon(wallet.type)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#f8f9fa' }}>{wallet.name}</p>
                <p style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                  {WALLET_TYPES.find(t => t.value === wallet.type)?.label || wallet.type}
                </p>
              </div>

              {/* Balance */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{
                  fontSize: '18px', fontWeight: 800,
                  color: wallet.balance >= 0 ? (wallet.color || '#ccff00') : '#f87171',
                }}>
                  {formatCurrency(wallet.balance)}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => openEdit(wallet)}
                  style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(wallet.id)}
                  disabled={deletingId === wallet.id}
                  style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {deletingId === wallet.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
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
