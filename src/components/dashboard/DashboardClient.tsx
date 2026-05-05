'use client'

import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES } from '@/lib/helpers'
import { 
  TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Plus, Activity, Bell,
  Settings, Shield, LogOut, Loader2, Sparkles, Info, CheckCircle2,
  Calendar, Eye, EyeOff
} from 'lucide-react'
import { subscribeToPush } from '@/actions/push'
import { getMentorInsight } from '@/actions/mentor'
import { getBalancePrediction } from '@/actions/prediction'
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
  userId: string
  userEmail?: string
  isPremium?: boolean
  hourlyRate?: number
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardClient({ data, userName, userId, userEmail, isPremium = false, hourlyRate = 0 }: DashboardClientProps) {
  const { privacyMode, setPrivacyMode } = useTheme()
  const router = useRouter()
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showSimulation, setShowSimulation] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mentorInsight, setMentorInsight] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    async function loadData() {
      const [insight, prediction] = await Promise.all([
        getMentorInsight(),
        getBalancePrediction()
      ])
      setMentorInsight(insight)
      setPredictionData(prediction)
    }
    loadData()

    // Auto-request notifications after 2 seconds if not granted
    const timer = setTimeout(() => {
      if (Notification.permission === 'default') {
        handleNotificationSubscription()
      }
    }, 2000)
    return () => clearTimeout(timer)
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
  const isAdmin = userId === 'cmoqgewvk000049yzrl4kobzw' || userEmail?.toLowerCase() === 'brunosscontatos@gmail.com'

  async function handleNotificationSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Este dispositivo não suporta notificações.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        
        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription()
        
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BIWJuJgeAXpIOG82po0M7lFNu-2Qa4UndgBXKm_nGM4SQoXjJVw97NNpB2rozBdTrRJmBgisXqOXrIdTQh0pkWA'
          })
        }
        
        const subJson = JSON.parse(JSON.stringify(subscription))
        await subscribeToPush({
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth
          }
        })
        console.log('Notificações ativadas com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao ativar notificações:', err)
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
            <div className="fade-in glass-card" style={{ 
              position: 'absolute', top: '60px', right: 0, width: '240px', 
              padding: '12px', zIndex: 1000, 
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{userName}</p>
                <p style={{ fontSize: '11px', color: '#71717a' }}>{userEmail}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button 
                  onClick={() => { router.push('/configuracoes'); setShowProfileMenu(false); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#fff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings size={16} color="#a1a1aa" />
                  </div>
                  Configurações
                </button>

                {isAdmin && (
                  <button 
                    onClick={() => { router.push('/admin'); setShowProfileMenu(false); }}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(204, 255, 0, 0.05)', color: '#ccff00', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={16} color="#ccff00" />
                    </div>
                    Painel Admin
                  </button>
                )}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

                <button 
                  onClick={() => router.push('/api/auth/signout')}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#f87171', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut size={16} color="#f87171" />
                  </div>
                  Sair da Conta
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
            onClick={() => setPrivacyMode(!privacyMode)}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer'
            }}
          >
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button onClick={() => setShowAddTransaction(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* AI Mentor Section */}
      {mentorInsight && (
        <div 
          className="fade-in"
          style={{ 
            marginBottom: '24px', 
            padding: '20px', 
            borderRadius: '24px', 
            background: mentorInsight.mood === 'danger' ? 'rgba(239, 68, 68, 0.1)' :
                       mentorInsight.mood === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                       mentorInsight.mood === 'happy' ? 'rgba(204, 255, 0, 0.1)' : 
                       'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${
              mentorInsight.mood === 'danger' ? 'rgba(239, 68, 68, 0.2)' :
              mentorInsight.mood === 'warning' ? 'rgba(245, 158, 11, 0.2)' :
              mentorInsight.mood === 'happy' ? 'rgba(204, 255, 0, 0.2)' : 
              'rgba(255, 255, 255, 0.08)'
            }`,
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            width: '44px', height: '44px', borderRadius: '12px', 
            background: mentorInsight.mood === 'danger' ? '#ef4444' :
                       mentorInsight.mood === 'warning' ? '#f59e0b' :
                       mentorInsight.mood === 'happy' ? '#ccff00' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: `0 0 20px ${
              mentorInsight.mood === 'danger' ? 'rgba(239, 68, 68, 0.3)' :
              mentorInsight.mood === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
              mentorInsight.mood === 'happy' ? 'rgba(204, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }`
          }}>
            {mentorInsight.mood === 'danger' ? <AlertCircle color="#fff" size={24} /> :
             mentorInsight.mood === 'warning' ? <Info color="#fff" size={24} /> :
             mentorInsight.mood === 'happy' ? <Sparkles color="#000" size={24} /> : 
             <Sparkles color="#000" size={24} />}
          </div>
          <div>
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: 800, 
              color: 'var(--text-main)',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {mentorInsight.title}
              <span style={{ 
                fontSize: '10px', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '2px 8px', 
                borderRadius: '99px',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}>MENTOR IA</span>
            </h3>
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-muted)', 
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              {mentorInsight.message}
            </p>
          </div>
        </div>
      )}

      {/* Balance Card - Elite Design */}
      <div className="scale-in" style={{ marginBottom: '32px' }}>
        <div className="gradient-card-green" style={{ 
          padding: '32px', borderRadius: '32px', 
          boxShadow: '0 20px 40px rgba(204, 255, 0, 0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative glass elements */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', transform: 'translateZ(0)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Saldo Disponível</p>
            <h2 className="blur-amount" style={{ fontSize: '48px', fontWeight: 900, color: '#000', letterSpacing: '-2px', marginBottom: '32px' }}>
              {formatCurrency(data.balance)}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.25)', borderRadius: '20px', transform: 'translateZ(0)' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(0,0,0,0.4)', marginBottom: '4px' }}>ENTRADAS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#000', fontWeight: 900 }}>
                  <TrendingUp size={14} />
                  <span className="blur-amount" style={{ fontSize: '16px' }}>{formatCurrency(data.currentIncome)}</span>
                </div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(0,0,0,0.06)', borderRadius: '20px', transform: 'translateZ(0)' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(0,0,0,0.4)', marginBottom: '4px' }}>SAÍDAS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#000', fontWeight: 900 }}>
                  <TrendingDown size={14} />
                  <span className="blur-amount" style={{ fontSize: '16px' }}>{formatCurrency(data.currentExpense)}</span>
                </div>
                {hourlyRate > 0 && (
                  <p style={{ fontSize: '9px', color: 'rgba(0,0,0,0.4)', fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={8} />
                    {(data.currentExpense / hourlyRate).toFixed(1)}H DE VIDA
                  </p>
                )}
              </div>
            </div>
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

      {/* Prediction Area */}
      {predictionData && (
        <div className="fade-in glass-card" style={{ padding: '24px', borderRadius: '32px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#ccff00" />
                Sua Bola de Cristal
              </h3>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Previsão baseada no seu histórico</p>
            </div>
            <div style={{ background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '99px' }}>PRÓXIMOS 30 DIAS</div>
          </div>

          <div style={{ height: '180px', width: '100%', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData.slice(0, 30)}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#ccff00', fontWeight: 800 }}
                  labelStyle={{ display: 'none' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#ccff00" 
                  strokeWidth={3} 
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '10px', color: '#71717a', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Saldo Previsto</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: predictionData[30]?.balance >= 0 ? '#fff' : '#ef4444' }}>
                {formatCurrency(predictionData[30]?.balance || 0)}
              </p>
            </div>
            <div style={{ flex: 1, padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: '10px', color: '#71717a', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Contas a Vencer</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                {formatCurrency(predictionData.slice(0, 30).reduce((acc: number, d: any) => acc + d.bills, 0))}
              </p>
            </div>
          </div>
        </div>
      )}

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
          <div className="card" style={{ padding: '24px', transform: 'translateZ(0)' }}>
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
