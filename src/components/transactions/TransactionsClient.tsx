'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Printer } from 'lucide-react'
import { formatCurrency, CATEGORIES } from '@/lib/helpers'
import { deleteTransaction } from '@/actions/transactions'
import { AddTransactionModal } from './AddTransactionModal'

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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [showClaudiaBio, setShowClaudiaBio] = useState(false)
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

  function handleExportPDF() {
    if (transactions.length === 0) {
      alert('Não há transações para exportar.')
      return
    }
    window.print()
  }

  const totalIn = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  const totalOut = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)

  // Group by specific day for timeline
  const grouped = transactions.reduce((acc: Record<string, Transaction[]>, tx) => {
    try {
      const d = new Date(tx.date)
      if (isNaN(d.getTime())) throw new Error('Invalid date')
      const key = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      if (!acc[key]) acc[key] = []
      acc[key].push(tx)
    } catch (err) {
      const key = 'Data Indefinida'
      if (!acc[key]) acc[key] = []
      acc[key].push(tx)
    }
    return acc
  }, {})

  return (
    <div className="fade-in" style={{ paddingTop: '80px', paddingBottom: '160px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 8px' }}>
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
            onClick={handleExportPDF}
            style={{ 
              height: '48px', paddingLeft: '16px', paddingRight: '16px', 
              borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', 
              color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', 
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontWeight: 700, fontSize: '14px', transition: 'all 0.2s'
            }}
            className="no-print"
          >
            <Printer size={18} />
            Gerar PDF
          </button>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div 
              onClick={() => setShowClaudiaBio(!showClaudiaBio)}
              style={{ 
                width: '74px', height: '74px', borderRadius: '18px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative', boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>CLAUDIA</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/claudia.png" alt="Claudia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {showClaudiaBio && (
              <div className="scale-in" style={{
                position: 'absolute', top: '100%', right: '0', width: '240px',
                background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
                marginTop: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <strong>Olá, eu sou a Claudia!</strong> 🦉🔍<br/><br/>
                  Sou a especialista em auditoria da Contte. Minha missão é vasculhar seu extrato em busca de cobranças duplicadas ou erros, garantindo que você não pague um centavo a mais!
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
                      <div 
                        onClick={() => setSelectedTx(tx)}
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}
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
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                        disabled={deletingId === tx.id}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a',
                          display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
                      >
                        {deletingId === tx.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      {selectedTx && <AddTransactionModal initialData={selectedTx} onClose={() => setSelectedTx(null)} />}

      {/* FAB Add Button */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed',
          bottom: '110px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#ccff00',
          color: '#000',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(204,255,0,0.4)',
          zIndex: 40,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="Nova Transação"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* --- Printable PDF Area (Hidden from UI) --- */}
      <div id="printable-statement" style={{ 
        display: 'none', 
        padding: '40px', 
        background: '#fff', 
        color: '#000', 
        fontFamily: 'sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccff00', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, color: '#000' }}>CONTTE</h1>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>EXTRATO DE MOVIMENTAÇÃO BANCÁRIA</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', fontWeight: 700 }}>Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px', background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Entradas</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>{formatCurrency(totalIn)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Saídas</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(totalOut)}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Saldo Período</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#000' }}>{formatCurrency(totalIn - totalOut)}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>DATA</th>
              <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>DESCRIÇÃO</th>
              <th style={{ padding: '12px', fontSize: '12px', color: '#666' }}>CATEGORIA</th>
              <th style={{ padding: '12px', fontSize: '12px', color: '#666', textAlign: 'right' }}>VALOR</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600 }}>{tx.description}</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>{CATEGORIES.find(c => c.value === tx.category)?.label || tx.category}</td>
                <td style={{ padding: '12px', fontSize: '14px', fontWeight: 800, textAlign: 'right', color: tx.type === 'INCOME' ? '#22c55e' : '#000' }}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#999' }}>ESTE DOCUMENTO FOI GERADO PELA PLATAFORMA CONTTE E NÃO POSSUI VALOR FISCAL.</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-statement, #printable-statement * { visibility: visible !important; }
          #printable-statement { 
            display: block !important; 
            position: fixed !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important;
            z-index: 9999 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
