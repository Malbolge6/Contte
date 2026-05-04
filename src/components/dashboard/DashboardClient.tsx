'use client'

import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES } from '@/lib/helpers'
import {
  TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Plus, Activity, Bell,
  Settings, Shield, LogOut
} from 'lucide-react'
import { subscribeToPush } from '@/actions/push'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'
import { QuickSimulationModal } from './QuickSimulationModal'
import { useState, useEffect } from 'react'

const COLORS = ['#ccff00', '#f472b6', '#c084fc', '#38bdf8', '#34d399', '#a3e635', '#fde047', '#818cf8']

interface DashboardClientProps {
  data: any
  userName: string
  userEmail?: string
  isPremium?: boolean
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardClient({ data, userName, userEmail, isPremium = false }: DashboardClientProps) {
  const router = useRouter()
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#fff' }}>
        <Loader2 className="animate-spin" size={48} style={{ margin: '40px auto' }} />
        <p>Carregando seus dados financeiros...</p>
      </div>
    )
  }

  const firstName = userName?.split(' ')[0] || 'Usuário'
  const isAdmin = userEmail?.toLowerCase() === 'brunosscontatos@gmail.com'

  async function handleNotificationSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Seu dispositivo não suporta notificações.')
      return
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BPaYV_y2p0I6pUfG3Gj6L7v6_p6z_H_h1p_E_T_O_Y_N_p_G_h_E_1_G_g_I_E' // Public VAPID Key (Placeholder)
        })
        
        const subJson = JSON.parse(JSON.stringify(subscription))
        await subscribeToPush({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth
          }
        })
        alert('Notificações ativadas com sucesso! 🔔')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao ativar notificações.')
    }
  }

  if (!data) {
    return (
      <div className="fade-in" style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#a1a1aa', fontSize: '15px' }}>
            Configure a conexão com o banco de dados para ver seu painel.
          </p>
        </div>
      </div>
    )
  }

  const categoryData = Object.entries(data.categoryBreakdown || {}).map(([key, value]) => {
    const cat = CATEGORIES.find(c => c.value === key)
    return { name: cat?.label || key, value: value as number }
  })

  const alerts = [
    ...(data.overdueBills || []).map((b: any) => ({ ...b, isOverdue: true })),
    ...(data.pendingBills || []).filter((b: any) => getDaysUntilDue(b.dueDate) <= 3).map((b: any) => ({ ...b, isOverdue: false })),
  ]

  return (
    <div className="fade-in" style={{ paddingTop: '8px' }}>
      {/* Greeting Area */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: 'none', cursor: 'pointer' }}
          >
            👤
          </button>
          {showProfileMenu && (
            <div className="fade-in" style={{ 
              position: 'absolute', top: '60px', left: 0, width: '220px', 
              background: '#16161f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden'
            }}>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button onClick={() => router.push('/configuracoes')} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <Settings size={16} /> Configurações
                </button>
                {isAdmin && (
                  <button onClick={() => router.push('/admin')} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'rgba(204, 255, 0, 0.05)', color: '#ccff00', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <Shield size={16} /> Painel Admin
                  </button>
                )}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <button onClick={() => router.push('/api/auth/signout')} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#f87171', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <LogOut size={16} /> Sair
                </button>
              </div>
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{ color: '#71717a', fontSize: '12px', fontWeight: 500 }}>Resumo de hoje</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleNotificationSubscription}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer'
            }}
          >
            <Bell size={18} />
          </button>
          <button onClick={() => setShowAddTransaction(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Balance Card - Premium Fintech Gradient */}
      <div className="gradient-card-green" style={{ borderRadius: '24px', padding: '28px', marginBottom: '24px', boxShadow: '0 12px 40px rgba(204, 255, 0, 0.15)' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', opacity: 0.8 }}>
          Saldo Disponível
        </p>
        <p style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '24px', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          {formatCurrency(data.balance)}
        </p>

        <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ArrowUpRight size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Entradas</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 800 }}>
              {formatCurrency(data.currentIncome)}
            </p>
          </div>
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ArrowDownRight size={16} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Saídas</span>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 800 }}>
              {formatCurrency(data.currentExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action: Simulation */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => {
            if (!isPremium) {
              router.push('/premium')
              return
            }
            setShowSimulation(true)
          }}
          style={{
            width: '100%', padding: '20px', borderRadius: '24px',
            background: 'rgba(204, 255, 0, 0.05)',
            border: '1px solid rgba(204, 255, 0, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={22} color="#ccff00" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#ccff00' }}>Simulação Rápida</p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>Veja o impacto antes de gastar</p>
            </div>
          </div>
          <ChevronRight size={22} color="#ccff00" />
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertCircle size={20} color="#f43f5e" />
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#f43f5e' }}>
              Atenção: {alerts.length} conta(s)
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.slice(0, 3).map((bill: any) => {
              const days = getDaysUntilDue(bill.dueDate)
              return (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{bill.name}</p>
                    <p style={{ fontSize: '12px', color: bill.isOverdue ? '#f43f5e' : '#ccff00', marginTop: '2px' }}>
                      {bill.isOverdue ? `Vencida há ${Math.abs(days)} dia(s)` : days === 0 ? 'Vence hoje!' : `Vence em ${days} dia(s)`}
                    </p>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    {formatCurrency(bill.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid for Charts & Data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Monthly Evolution */}
        {data.monthlyData && data.monthlyData.length > 0 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
              Estatísticas
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                  formatter={(val: number) => formatCurrency(val)}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="income" stroke="#ccff00" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Categories */}
        {categoryData.length > 0 && (
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
              Onde você gastou
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryData.slice(0, 3).map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {data.recentTransactions && data.recentTransactions.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              Transações Recentes
            </h3>
            <Link href="/transacoes" style={{ fontSize: '13px', color: '#ccff00', fontWeight: 600, textDecoration: 'none' }}>
              Ver todas
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.recentTransactions.slice(0, 5).map((tx: any) => {
              const cat = CATEGORIES.find(c => c.value === tx.category)
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      {cat?.icon || '💸'}
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8f9fa' }}>
                        {tx.description}
                      </p>
                      <p style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: tx.type === 'INCOME' ? '#4ade80' : '#f87171', flexShrink: 0 }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}



      {showAddTransaction && <AddTransactionModal onClose={() => setShowAddTransaction(false)} />}
      {showSimulation && (
        <QuickSimulationModal 
          currentTotalExpenses={data.currentExpense}
          currentBalance={data.balance}
          categoryData={data.categoryBreakdown}
          goals={data.goals}
          onClose={() => setShowSimulation(false)}
        />
      )}
    </div>
  )
}
