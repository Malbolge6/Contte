import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="fade-in" style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto 100px' }}>
      <div style={{
        width: '80px', height: '80px', margin: '0 auto 24px',
        background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <CheckCircle size={40} color="#4ade80" />
      </div>
      
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8f9fa', letterSpacing: '-0.5px', marginBottom: '12px' }}>
        Assinatura Ativa! 🎉
      </h1>
      <p style={{ color: '#a0a0b0', fontSize: '15px', lineHeight: 1.5, marginBottom: '32px' }}>
        Pagamento aprovado. Agora você tem acesso ilimitado a todas as ferramentas do Contte Premium. 
        Pode demorar alguns segundos para a atualização refletir no seu painel.
      </p>

      <Link 
        href="/dashboard"
        style={{
          display: 'inline-flex', padding: '16px 32px', borderRadius: '16px', background: '#ccff00',
          color: '#050505', fontSize: '16px', fontWeight: 800, textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(204, 255, 0, 0.3)'
        }}
      >
        Ir para o Dashboard
      </Link>
    </div>
  )
}
