'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, Search, Plus, X, Loader2, 
  TrendingDown, AlertCircle, CheckCircle2, ChevronRight,
  Tv, Gamepad2, Wrench, GraduationCap, AppWindow, Dumbbell
} from 'lucide-react'
import { formatCurrency, parseCurrency, maskCurrency } from '@/lib/helpers'
import { upsertSubscription } from '@/actions/subscriptions'
import { createPortal } from 'react-dom'

interface Subscription {
  id?: string
  name: string
  logo: string
  amount: number
  category: string
}

const SUBSCRIPTION_TEMPLATES = [
  {
    category: 'STREAMING',
    icon: <Tv size={18} />,
    color: '#E50914',
    apps: [
      { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Netflix-new-icon.png/960px-Netflix-new-icon.png' },
      { name: 'Prime Video', logo: 'https://m.media-amazon.com/images/I/417jywf7ZAL.png' },
      { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Disney_plus_icon.png/960px-Disney_plus_icon.png' },
      { name: 'HBO Max', logo: 'https://m.media-amazon.com/images/I/717+-1StDDL.png' },
      { name: 'Globoplay', logo: 'https://static.wixstatic.com/media/64ad72_f22b0aff0a514bb7b341dcf7740ca3ce~mv2.png/v1/fill/w_201,h_201,al_c,q_95,enc_avif,quality_auto/icon_hbomax.png' },
      { name: 'Star+', logo: 'https://images.seeklogo.com/logo-png/52/1/star-plus-logo-png_seeklogo-521039.png' },
      { name: 'Paramount+', logo: 'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/paramount-plus-app-icon.png' },
      { name: 'Apple TV+', logo: 'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/apple-tv-app-icon.png' },
      { name: 'Spotify', logo: 'https://images.seeklogo.com/logo-png/40/1/spotify-logo-png_seeklogo-408560.png' },
      { name: 'Deezer', logo: 'https://www.oxigenio.fm/wp-content/uploads/2025/06/Deezer-1.png' },
      { name: 'Amazon Music', logo: 'https://img.icons8.com/?size=256&id=C3MpENApv7Rd&format=png' },
      { name: 'YouTube Music', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/960px-Youtube_Music_icon.svg.png' },
    ]
  },
  {
    category: 'GAMES',
    icon: <Gamepad2 size={18} />,
    color: '#107C10',
    apps: [
      { name: 'Xbox Game Pass', logo: 'https://cdn2.steamgriddb.com/icon_thumb/81a1e36d1d8c565e1554959779ce2aad.png' },
      { name: 'PlayStation Plus', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/PlayStationPlus.svg/960px-PlayStationPlus.svg.png' },
      { name: 'Nintendo Switch Online', logo: 'https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_200/Marketing/pmp-switch-vouchers/nso-icon' },
    ]
  },
  {
    category: 'UTILIDADES',
    icon: <Wrench size={18} />,
    color: '#007AFF',
    apps: [
      { name: 'iCloud+', logo: 'https://logos-world.net/wp-content/uploads/2022/04/iCloud-Logo-700x394.png' },
      { name: 'Google One', logo: 'https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/google-one-logo-icon.png' },
      { name: 'Dropbox', logo: 'https://cdn.freebiesupply.com/logos/large/2x/dropbox-2-logo-png-transparent.png' },
      { name: 'Microsoft 365', logo: 'https://brandlogos.net/wp-content/uploads/2022/10/microsoft_365-logo_brandlogos.net_j9l2g-512x563.png' },
    ]
  },
  {
    category: 'EDUCAÇÃO',
    icon: <GraduationCap size={18} />,
    color: '#58CC02',
    apps: [
      { name: 'Duolingo', logo: 'https://brandlogos.net/wp-content/uploads/2023/09/duolingo_icon-logo_brandlogos.net_aru6q-512x512.png' },
      { name: 'Coursera', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/960px-Coursera-Logo_600x600.svg.png' },
      { name: 'Udemy', logo: 'https://logosmarcas.net/wp-content/uploads/2021/11/Udemy-Logo-650x366.png' },
      { name: 'Alura', logo: 'https://play-lh.googleusercontent.com/yDjaHCaOn_O89vnY7eOKH6ElEBtJrmN2CSI4yhiP1_GVC2zrxXWSFGxO0lt9-CU0mV4=w240-h480-rw' },
    ]
  },
  {
    category: 'APPS / SOFTWARE PRO',
    icon: <AppWindow size={18} />,
    color: '#9C27B0',
    apps: [
      { name: 'Adobe Creative Cloud', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/250px-Adobe_Creative_Cloud_rainbow_icon.svg.png' },
      { name: 'Canva', logo: 'https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHHFT949fUipzkiFOBH3fAiZZUCdYojwUyX2aTonS1aIwMrx6NUIsHfUHSLzjGJFxxo4K81Ei7WzcnqEk8W.MgwaH94jRmtJPRlv4F_Z0WGxl4DqVmtd6.Y76H4VGL9nDXhYbs1dM3Ct_E.XEwVjczMY-&format=source&h=115' },
      { name: 'Notion', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png' },
      { name: 'ChatGPT', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/960px-ChatGPT_logo.svg.png' },
      { name: 'Capcut Pro', logo: 'https://images.seeklogo.com/logo-png/43/1/capcut-logo-png_seeklogo-437025.png' },
      { name: 'Tinder Plus', logo: 'https://www.citypng.com/public/uploads/preview/tinder-gold-app-logo-701751695134800ak5uhqhjdq.png' },
      { name: 'Bumble', logo: 'https://images.icon-icons.com/3132/PNG/512/bumble_social_network_network_communication_conversation_icon_192254.png' },
    ]
  },
  {
    category: 'FITNESS',
    icon: <Dumbbell size={18} />,
    color: '#FFD700',
    apps: [
      { name: 'Smart Fit', logo: 'https://logowik.com/content/uploads/images/smart-fit7853.jpg' },
      { name: 'Gympass', logo: 'https://res.cloudinary.com/gastr-catering/images/f_auto,q_auto/v1626827004/logo-gympass/logo-gympass.jpg?_i=AA' },
      { name: 'Wellhub', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Logo_wellhub.png' },
      { name: 'Freeletics', logo: 'https://play-lh.googleusercontent.com/LO9WIGjsLLYorVKw72slMNsBw-6ubiPDw0ll27Z51TJSdl98NyiHzc87OFGVohnOOkNn=s94-rw' },
    ]
  }
]

export function SubscriptionsClient({ initialSubscriptions }: { initialSubscriptions: Subscription[] }) {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [selectedApp, setSelectedApp] = useState<{ name: string, logo: string, category: string } | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const totalMonthly = subscriptions.reduce((acc, s) => acc + s.amount, 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp || !amount) return
    setLoading(true)
    try {
      const numericAmount = parseCurrency(amount)
      await upsertSubscription({
        name: selectedApp.name,
        logo: selectedApp.logo,
        category: selectedApp.category,
        amount: numericAmount
      })
      
      // Update local state for immediate feedback
      setSubscriptions(prev => {
        const existing = prev.find(s => s.name === selectedApp.name)
        if (existing) {
          return prev.map(s => s.name === selectedApp.name ? { ...s, amount: numericAmount } : s)
        }
        return [...prev, { name: selectedApp.name, logo: selectedApp.logo, category: selectedApp.category, amount: numericAmount }]
      })

      setSelectedApp(null)
      setAmount('')
      router.refresh()
    } catch (err) {
      alert('Erro ao salvar assinatura')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
      
      {/* Header Summary */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Assinaturas
        </h1>
        <p style={{ color: '#71717a', fontSize: '15px', fontWeight: 500, marginBottom: '24px' }}>
          Gerencie seus custos fixos digitais de forma inteligente.
        </p>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', padding: '32px', borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.05)', display: 'inline-flex',
          flexDirection: 'column', alignItems: 'center', gap: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Custo Mensal Total</p>
          <p style={{ fontSize: '48px', fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>
            -{formatCurrency(totalMonthly)}
          </p>
          <div style={{ padding: '6px 12px', background: 'rgba(248, 113, 113, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={14} color="#f87171" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f87171' }}>{subscriptions.length} assinaturas ativas</span>
          </div>
        </div>
      </div>

      {/* Grid by Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {SUBSCRIPTION_TEMPLATES.map((cat) => (
          <div key={cat.category}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingLeft: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color }}>
                {cat.icon}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{cat.category}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '16px' }}>
              {cat.apps.map((app) => {
                const sub = subscriptions.find(s => s.name === app.name)
                const isActive = !!sub && sub.amount > 0

                return (
                  <div 
                    key={app.name}
                    onClick={() => {
                      setSelectedApp({ ...app, category: cat.category })
                      setAmount(sub ? maskCurrency(sub.amount.toString()) : '')
                    }}
                    style={{
                      aspectRatio: '1/1', background: 'rgba(255,255,255,0.03)', borderRadius: '24px',
                      border: `1px solid ${isActive ? '#ccff0040' : 'rgba(255,255,255,0.05)'}`,
                      padding: '16px', cursor: 'pointer', transition: 'all 0.3s ease',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '12px', position: 'relative', overflow: 'hidden'
                    }}
                    className="hover-card"
                  >
                    {isActive && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        <CheckCircle2 size={16} color="#ccff00" />
                      </div>
                    )}
                    
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: '#fff', padding: '4px' }}>
                      <img src={app.logo} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                        {app.name}
                      </p>
                      {isActive && (
                        <p style={{ fontSize: '10px', fontWeight: 800, color: '#ccff00', marginTop: '2px' }}>
                          {formatCurrency(sub.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Modal */}
      {selectedApp && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedApp(null)}>
          <div className="modal-content" style={{ maxWidth: '400px', margin: 'auto' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#fff', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <img src={selectedApp.logo} alt={selectedApp.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{selectedApp.name}</h2>
                  <p style={{ fontSize: '14px', color: '#71717a' }}>{selectedApp.category}</p>
                </div>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#71717a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Valor Mensal</label>
                  <input 
                    type="text" className="input-field" placeholder="R$ 0,00" autoFocus
                    value={amount} onChange={e => setAmount(maskCurrency(e.target.value))} required
                    style={{ fontSize: '24px', textAlign: 'center', fontWeight: 800, height: '64px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setSelectedApp(null)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={loading} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: '#ccff00', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Salvar Assinatura'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
