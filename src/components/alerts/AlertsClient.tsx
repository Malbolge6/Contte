'use client'

import { AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue } from '@/lib/helpers'
import Link from 'next/link'

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string | Date

}

interface AlertsClientProps {
  alerts: {
    upcoming: Bill[]
    overdue: Bill[]
  }
}

export function AlertsClient({ alerts }: AlertsClientProps) {
  const hasAlerts = alerts.overdue.length > 0 || alerts.upcoming.length > 0

  return (
    <div className="fade-in" style={{ paddingTop: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.5px' }}>
          Alertas
        </h1>
        <p style={{ color: '#6b6b80', fontSize: '13px', marginTop: '4px' }}>
          Contas que precisam de atenção
        </p>
      </div>

      {!hasAlerts ? (
        <div className="card" style={{ padding: '50px 20px', textAlign: 'center' }}>
          <CheckCircle size={48} color="#4ade80" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8f9fa', marginBottom: '8px' }}>
            Tudo em dia! 🎉
          </h3>
          <p style={{ fontSize: '14px', color: '#6b6b80' }}>
            Nenhuma conta vencida ou próxima de vencer
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.overdue.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertCircle size={16} color="#f87171" />
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#f87171' }}>
                  Contas Vencidas ({alerts.overdue.length})
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {alerts.overdue.map(bill => {
                  const days = Math.abs(getDaysUntilDue(bill.dueDate))
                  return (
                    <div
                      key={bill.id}
                      style={{
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '14px', padding: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8f9fa' }}>{bill.name}</p>
                        <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                          Venceu {days === 0 ? 'hoje' : `há ${days} dia(s)`} · {formatDate(bill.dueDate)}
                        </p>

                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#f87171' }}>
                          {formatCurrency(bill.amount)}
                        </p>
                        <Link
                          href="/contas"
                          style={{ fontSize: '12px', color: '#ccff00', fontWeight: 600, textDecoration: 'none', marginTop: '6px', display: 'block' }}
                        >
                          Pagar →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {alerts.upcoming.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color="#ccff00" />
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#ccff00' }}>
                  Vencendo em breve ({alerts.upcoming.length})
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {alerts.upcoming.map(bill => {
                  const days = getDaysUntilDue(bill.dueDate)
                  return (
                    <div
                      key={bill.id}
                      style={{
                        background: 'rgba(204, 255, 0, 0.06)',
                        border: '1px solid rgba(204, 255, 0, 0.2)',
                        borderRadius: '14px', padding: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#f8f9fa' }}>{bill.name}</p>
                        <p style={{ fontSize: '12px', color: '#ccff00', marginTop: '4px' }}>
                          {days === 0 ? 'Vence hoje!' : `Vence em ${days} dia(s)`} · {formatDate(bill.dueDate)}
                        </p>

                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#f8f9fa' }}>
                          {formatCurrency(bill.amount)}
                        </p>
                        <Link
                          href="/contas"
                          style={{ fontSize: '12px', color: '#ccff00', fontWeight: 600, textDecoration: 'none', marginTop: '6px', display: 'block' }}
                        >
                          Ver conta →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
