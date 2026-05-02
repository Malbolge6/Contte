import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="fade-in" style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto 100px' }}>
      <div style={{
        width: '80px', height: '80px', margin: '0 auto 24px',
        background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <AlertCircle size={40} color="#ef4444" />
      </div>
      
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.5px', marginBottom: '12px' }}>
        Pagamento Cancelado
      </h1>
      <p style={{ color: '#a0a0b0', fontSize: '15px', lineHeight: 1.5, marginBottom: '32px' }}>
        O processo de assinatura foi interrompido e nenhuma cobrança foi feita. Você pode tentar novamente quando quiser.
      </p>

      <Link 
        href="/premium"
        style={{
          display: 'inline-flex', padding: '16px 32px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
          color: '#fff', fontSize: '16px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        Tentar novamente
      </Link>
    </div>
  )
}
