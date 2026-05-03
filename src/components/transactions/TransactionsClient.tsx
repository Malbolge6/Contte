'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Trash2, Loader2, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react'
import { formatCurrency, formatDate, CATEGORIES } from '@/lib/helpers'
import { deleteTransaction } from '@/actions/transactions'
import { AddTransactionModal } from './AddTransactionModal'
import { ImportModal } from './ImportModal'
import { BrainCircuit } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: string
  category: string
  description: string
  date: string | Date

  paymentMethod?: string | null
  installments?: number | null
  totalInstallments?: number | null
  notes?: string | null
}

interface TransactionsClientProps {
  transactions: Transaction[]
}

export function TransactionsClient({ transactions }: TransactionsClientProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transação?')) return
    setDeletingId(id)
    try {
      await deleteTransaction(id)
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  // Group by specific day for timeline
  const grouped = transactions.reduce((acc: Record<string, Transaction[]>, tx) => {
    const d = new Date(tx.date)
    const key = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {})

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Extrato
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
            Todo o seu histórico financeiro
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{ 
              height: '40px', paddingLeft: '14px', paddingRight: '14px', 
              borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', 
              color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', 
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px'
            }}
          >
            <BrainCircuit size={16} />
            Importar
          </button>
          <button 
            onClick={() => setShowAdd(true)} 
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: '#ccff00', color: '#050505', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', boxShadow: '0 8px 20px rgba(204, 255, 0, 0.2)' 
            }}
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            Seu extrato está vazio
          </p>
          <p style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Quando você gastar ou receber, aparecerá aqui.
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline continuous line */}
          <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

          {Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel} style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '24px', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #ccff00', background: '#111' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#a1a1aa', textTransform: 'capitalize' }}>
                  {dateLabel}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '48px' }}>
                {txs.map((tx, index) => {
                  const cat = CATEGORIES.find(c => c.value === tx.category)
                  const isLast = index === txs.length - 1
                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px', borderRadius: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'background 0.2s', cursor: 'pointer',
                        borderBottom: !isLast ? '1px solid rgba(255,255,255,0.02)' : 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: tx.type === 'INCOME' ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        flexShrink: 0
                      }}>
                        {cat?.icon || (tx.type === 'INCOME' ? '💰' : '💸')}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{cat?.label}</span>
                          {tx.totalInstallments && tx.totalInstallments > 1 && (
                            <>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3f3f46' }} />
                              <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                                {tx.installments}/{tx.totalInstallments}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <p style={{
                          fontSize: '16px', fontWeight: 800,
                          color: tx.type === 'INCOME' ? '#ccff00' : '#fff',
                        }}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                          disabled={deletingId === tx.id}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          {deletingId === tx.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}



      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  )
}
