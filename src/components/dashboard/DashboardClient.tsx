'use client'

import { formatCurrency, formatDate, getDaysUntilDue, CATEGORIES } from '@/lib/helpers'
import { 
  TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Plus, Activity, Bell,
  Settings, Shield, LogOut, Loader2, Sparkles, Info, CheckCircle2,
  Calendar, Eye, EyeOff, X, Calculator
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
import { TaxConfigModal } from './TaxConfigModal'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getTaxProfile } from '@/actions/tax'
import { createPortal } from 'react-dom'

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
  const [showTaxConfig, setShowTaxConfig] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mentorInsight, setMentorInsight] = useState<any>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [taxProfile, setTaxProfile] = useState<any>(null)
  const [showBalanceDetails, setShowBalanceDetails] = useState(false)
  const [showManuelBio, setShowManuelBio] = useState(false)
  const [showDanteBio, setShowDanteBio] = useState(false)
  const [showLamarBio, setShowLamarBio] = useState(false)
  const [showAntonioBio, setShowAntonioBio] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function loadData() {
      const [insight, prediction, tax] = await Promise.all([
        getMentorInsight(),
        getBalancePrediction(),
        getTaxProfile()
      ])
      setMentorInsight(insight)
      setPredictionData(prediction)
      if (tax.success) setTaxProfile(tax.data)
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
      {/* Total Balance Area */}
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#a0a0b0', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Saldo Total</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="blur-amount" style={{ fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px' }}>
                {formatCurrency(data.balance)}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setPrivacyMode(!privacyMode)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#71717a', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button 
                  onClick={() => setShowBalanceDetails(true)}
                  style={{ background: 'rgba(204, 255, 0, 0.1)', border: '1px solid rgba(204, 255, 0, 0.2)', color: '#ccff00', fontSize: '11px', fontWeight: 700, padding: '0 12px', borderRadius: '20px', cursor: 'pointer', height: '32px' }}
                >
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Details Modal */}
        {showBalanceDetails && createPortal(
          <div 
            style={{ 
              position: 'fixed', inset: 0, 
              background: 'rgba(0,0,0,0.85)', 
              backdropFilter: 'blur(10px)', 
              zIndex: 9999, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: '16px' 
            }} 
            onClick={() => setShowBalanceDetails(false)}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{ 
                width: '100%', 
                maxWidth: '440px', 
                maxHeight: 'calc(100vh - 32px)',
                background: '#0a0a0a', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '28px', 
                overflowY: 'auto',
                position: 'relative', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Composição do Saldo</h2>
                <button 
                  onClick={() => setShowBalanceDetails(false)} 
                  style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '8px' }}>Seu saldo é a soma de todas as suas carteiras ativas.</p>
                
                {(data.wallets || []).map((w: any) => (
                  <div key={w.id} style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${w.color || '#ccff00'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {w.type === 'bank' ? '🏦' : w.type === 'digital' ? '📱' : '💳'}
                      </div>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{w.name}</span>
                    </div>
                    <span style={{ color: w.balance >= 0 ? '#ccff00' : '#f87171', fontWeight: 800 }}>{formatCurrency(w.balance)}</span>
                  </div>
                ))}

                <div style={{ marginTop: '12px', padding: '20px', borderRadius: '20px', background: '#ccff00', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>SALDO TOTAL</span>
                  <span style={{ fontWeight: 900, fontSize: '20px' }}>{formatCurrency(data.balance)}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setShowAddTransaction(true)} style={{ flex: 1, height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="#fff" /></div>
            Adicionar
          </button>
          <button onClick={() => router.push('/timeline')} style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#a78bfa', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <Activity size={24} color="#000" />
          </button>
          <button onClick={() => setShowSimulation(true)} style={{ flex: 1, height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            Simular
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={14} color="#fff" /></div>
          </button>
        </div>
      </div>

      {/* AI Mentor Insight (Purple Card) */}
      {mentorInsight && (
        <div className="fade-in" style={{ marginBottom: '16px', background: '#a78bfa', borderRadius: '24px', padding: '24px', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>{mentorInsight.title}</h3>
            <p style={{ fontSize: '13px', fontWeight: 500, opacity: 0.9, lineHeight: 1.5 }}>{mentorInsight.message}</p>
          </div>
          <div 
            onClick={() => setShowManuelBio(!showManuelBio)}
            style={{ 
              width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', flexShrink: 0, 
              cursor: 'pointer', border: '2px solid rgba(255,255,255,0.3)',
              transition: 'transform 0.2s', transform: showManuelBio ? 'scale(1.1)' : 'scale(1)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 5, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>MANUEL</div>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <img src="/images/manuel.png" alt="Manuel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {showManuelBio && (
            <div className="scale-in" style={{
              position: 'absolute', bottom: '100%', right: '20px', width: '220px',
              background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
              marginBottom: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 10, border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
                <strong>Olá, eu sou o Manuel!</strong> 🦥<br/><br/>
                Sou o mentor de economia da Contte. Minha missão é analisar seus dados com calma e te avisar sempre que seu saldo estiver em perigo ou quando houver chances de economizar.
              </p>
              <div style={{ 
                position: 'absolute', top: '100%', right: '30px', 
                width: '0', height: '0', 
                borderLeft: '10px solid transparent', borderRight: '10px solid transparent', 
                borderTop: '10px solid #000' 
              }} />
            </div>
          )}
        </div>
      )}

      {/* Monthly Spent / Limited Balance (Green Card) */}
      <div className="scale-in" style={{ marginBottom: '16px', position: 'relative' }}>
        <div style={{ background: '#ccff00', borderRadius: '24px', padding: '24px', color: '#000', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, opacity: 0.7 }}>Gasto Mensal</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '4px', marginBottom: '16px' }}>
                <h2 className="blur-amount" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                  {formatCurrency(data.currentExpense)}
                </h2>
                {hourlyRate > 0 && (
                  <span style={{ background: '#000', color: '#ccff00', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>
                    {(data.currentExpense / hourlyRate).toFixed(1)}h vida
                  </span>
                )}
              </div>
            </div>
            
            <div 
              onClick={() => setShowAntonioBio(!showAntonioBio)}
              style={{ 
                width: '70px', height: '70px', borderRadius: '18px', 
                background: 'rgba(0,0,0,0.1)', flexShrink: 0, 
                position: 'relative', border: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>ANTONIO</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/antonio.png" alt="Antonio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
          
          {/* Simple progress bar representation */}
          <div style={{ display: 'flex', gap: '4px', height: '20px' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ flex: 1, background: i < 12 ? '#000' : 'rgba(0,0,0,0.1)', borderRadius: '4px' }} />
            ))}
          </div>
        </div>

        {showAntonioBio && (
          <div className="scale-in" style={{
            position: 'absolute', bottom: '100%', right: '20px', width: '240px',
            background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
            marginBottom: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 20, border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Olá, sou o Antonio!</strong> 🦦👔<br/><br/>
              Sou o líder da Contte. Minha missão é organizar sua vida financeira e garantir que seu caixa esteja sempre saudável e sob controle!
            </p>
            <div style={{ 
              position: 'absolute', top: '100%', right: '30px', 
              width: '0', height: '0', 
              borderLeft: '10px solid transparent', borderRight: '10px solid transparent', 
              borderTop: '10px solid #000' 
            }} />
          </div>
        )}
      </div>

      {/* Ideia 3: Respiro Fiscal (Advanced Bento Card) */}
      <div className="scale-in" style={{ marginBottom: '32px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '24px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#ccff00" />
              <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>Respiro Fiscal</h4>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                onClick={() => setShowDanteBio(!showDanteBio)}
                style={{ 
                  width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '16px', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)', position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', zIndex: 5, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>DANTE</div>
                <div style={{ width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src="/images/dante.png" alt="Dante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <button 
                onClick={() => setShowTaxConfig(true)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: '#ccff00', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Settings size={12} />
                Configurar
              </button>
            </div>
          </div>

          {showDanteBio && (
            <div className="scale-in" style={{
              background: 'rgba(0,0,0,0.4)', color: '#fff', padding: '12px', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', lineHeight: 1.4
            }}>
              <strong>Prazer, Dante!</strong> 🐢<br/>
              Sou o contador oficial da Contte. Cuido de toda a sua parte fiscal e tributos, garantindo que você pague apenas o necessário e mantenha seu respiro financeiro em dia.
            </div>
          )}

          {!taxProfile || taxProfile.taxProfile === 'NONE' ? (
            <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '12px' }}>Configure seu perfil fiscal para ver o cálculo real de impostos.</p>
              <button 
                onClick={() => setShowTaxConfig(true)}
                style={{ color: '#ccff00', fontSize: '13px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Configurar agora
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#71717a', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Base de Cálculo</p>
                  <p style={{ color: '#fff', fontSize: '18px', fontWeight: 900 }}>
                    {formatCurrency((() => {
                      const income = (data.recentTransactions || []).filter((t:any) => t.type === 'ENTRADA').reduce((acc:number, t:any) => acc + t.amount, 0)
                      const dependentsDeduction = (taxProfile.taxDependents || 0) * 189.59
                      const pension = taxProfile.taxPensionAmount || 0
                      const businessExp = taxProfile.taxProfile === 'AUTONOMO' ? (taxProfile.taxBusinessExpenses || 0) : 0
                      return Math.max(0, income - dependentsDeduction - pension - businessExp)
                    })())}
                  </p>
                </div>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#71717a', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Imposto Estimado</p>
                  <p style={{ color: '#ccff00', fontSize: '18px', fontWeight: 900 }}>
                    {formatCurrency((() => {
                      const income = (data.recentTransactions || []).filter((t:any) => t.type === 'ENTRADA').reduce((acc:number, t:any) => acc + t.amount, 0)
                      const dependentsDeduction = (taxProfile.taxDependents || 0) * 189.59
                      const pension = taxProfile.taxPensionAmount || 0
                      const businessExp = taxProfile.taxProfile === 'AUTONOMO' ? (taxProfile.taxBusinessExpenses || 0) : 0
                      const base = Math.max(0, income - dependentsDeduction - pension - businessExp)
                      
                      if (taxProfile.taxProfile === 'PJ') return 0
                      if (base <= 2259.20) return 0
                      if (base <= 2828.65) return (base * 0.075) - 169.44
                      if (base <= 3751.05) return (base * 0.15) - 381.44
                      if (base <= 4664.68) return (base * 0.225) - 662.77
                      return (base * 0.275) - 896.00
                    })())}
                  </p>
                </div>
              </div>

              <div style={{ background: 'rgba(204, 255, 0, 0.03)', border: '1px solid rgba(204, 255, 0, 0.1)', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Calculator size={14} color="#ccff00" />
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#ccff00' }}>Por que esse valor?</p>
                </div>
                <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: 1.5 }}>
                  {(() => {
                    const income = (data.recentTransactions || []).filter((t:any) => t.type === 'ENTRADA').reduce((acc:number, t:any) => acc + t.amount, 0)
                    if (income <= 2259.20) return 'Suas entradas este mês estão abaixo do limite de isenção da Receita Federal (R$ 2.259,20). Você não deve pagar imposto agora.'
                    if (taxProfile.taxProfile === 'CLT') return `Sendo CLT, sua empresa retém aproximadamente ${formatCurrency(150)} na fonte. O valor mostrado é o ajuste mensal para te ajudar a conferir seu holerite.`
                    if (taxProfile.taxProfile === 'AUTONOMO') return `Como Autônomo, sua base de cálculo é de ${formatCurrency(income - (taxProfile.taxDependents * 189.59))} após as deduções. Lembre-se de emitir o DARF até o último dia útil do mês.`
                    return 'Consulte os detalhes de dividendos e retiradas PJ com seu contador para um cálculo fora da base pessoal.'
                  })()}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Action: Simulation */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
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
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowLamarBio(!showLamarBio);
              }}
              style={{ 
                width: '70px', height: '70px', borderRadius: '18px', 
                background: 'rgba(204, 255, 0, 0.1)', flexShrink: 0, 
                position: 'relative', border: '1px solid rgba(204, 255, 0, 0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>LAMAR</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/lamar.png" alt="Lamar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#ccff00' }}>Simulação Rápida</p>
              <p style={{ fontSize: '13px', color: '#71717a' }}>Veja o impacto antes de gastar</p>
            </div>
          </div>
          <ChevronRight size={22} color="#ccff00" />
        </button>

        {showLamarBio && (
          <div className="scale-in" style={{
            position: 'absolute', bottom: '100%', left: '20px', width: '240px',
            background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
            marginBottom: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 20, border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <strong>Fala, eu sou o Lamar!</strong> 🦝🚀<br/><br/>
              Sou o estrategista de metas da Contte. Minha função é simular o impacto de cada gasto no seu plano de vida, garantindo que você chegue nos seus objetivos mais rápido!
            </p>
            <div style={{ 
              position: 'absolute', top: '100%', left: '30px', 
              width: '0', height: '0', 
              borderLeft: '10px solid transparent', borderRight: '10px solid transparent', 
              borderTop: '10px solid #000' 
            }} />
          </div>
        )}
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
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '20px', padding: '20px', marginBottom: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} color="#f43f5e" />
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#f43f5e' }}>
                Atenção: {alerts.length} conta(s)
              </p>
            </div>

            <div 
              onClick={() => setShowAntonioBio(!showAntonioBio)}
              style={{ 
                width: '70px', height: '70px', borderRadius: '18px', 
                background: 'rgba(244, 63, 94, 0.15)', flexShrink: 0, 
                position: 'relative', border: '1px solid rgba(244, 63, 94, 0.2)',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>ANTONIO</div>
              <div style={{ width: '100%', height: '100%', borderRadius: '18px', overflow: 'hidden' }}>
                <img src="/images/antonio.png" alt="Antonio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {showAntonioBio && (
              <div className="scale-in" style={{
                position: 'absolute', bottom: '100%', right: '20px', width: '240px',
                background: '#000', color: '#fff', padding: '16px', borderRadius: '20px',
                marginBottom: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 20, border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{ fontSize: '12px', lineHeight: 1.5 }}>
                  <strong>Olá, sou o Antonio!</strong> 🦦👔<br/><br/>
                  Sou o líder da Contte. Minha missão é organizar sua vida financeira e garantir que seu caixa esteja sempre saudável e sob controle!
                </p>
                <div style={{ 
                  position: 'absolute', top: '100%', right: '30px', 
                  width: '0', height: '0', 
                  borderLeft: '10px solid transparent', borderRight: '10px solid transparent', 
                  borderTop: '10px solid #000' 
                }} />
              </div>
            )}
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

      {/* Payment History / Operations */}
      {data.recentTransactions && data.recentTransactions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              Histórico
            </h3>
            <Link href="/transacoes" style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 600, textDecoration: 'none' }}>
              Ver Todos
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recentTransactions.slice(0, 5).map((tx: any) => {
              const cat = CATEGORIES.find(c => c.value === tx.category)
              return (
                <div key={tx.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#161618', padding: '16px', borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      {cat?.icon || '💸'}
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                        {tx.description}
                      </p>
                      <p style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: tx.type === 'INCOME' ? '#ccff00' : '#fff', flexShrink: 0 }}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showTaxConfig && (
        <TaxConfigModal 
          onClose={() => setShowTaxConfig(false)} 
          onSuccess={async () => {
            const tax = await getTaxProfile()
            if (tax.success) setTaxProfile(tax.data)
          }} 
        />
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
