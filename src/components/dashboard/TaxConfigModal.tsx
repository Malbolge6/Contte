'use client'

import { useState, useEffect } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Shield, 
  Users, Heart, Briefcase, Calculator,
  CheckCircle2, Info
} from 'lucide-react'
import { updateTaxProfile, getTaxProfile } from '@/actions/tax'

interface TaxConfigModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function TaxConfigModal({ onClose, onSuccess }: TaxConfigModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    taxProfile: 'NONE',
    taxDependents: 0,
    taxPensionAmount: 0,
    taxPgblContribution: false,
    taxBusinessExpenses: 0
  })

  useEffect(() => {
    async function load() {
      const res = await getTaxProfile()
      if (res.success && res.data) {
        setFormData({
          taxProfile: res.data.taxProfile || 'NONE',
          taxDependents: res.data.taxDependents || 0,
          taxPensionAmount: res.data.taxPensionAmount || 0,
          taxPgblContribution: res.data.taxPgblContribution || false,
          taxBusinessExpenses: res.data.taxBusinessExpenses || 0
        })
      }
    }
    load()
  }, [])

  async function handleSave() {
    setLoading(true)
    const res = await updateTaxProfile(formData)
    if (res.success) {
      onSuccess()
      onClose()
    } else {
      alert('Erro ao salvar: ' + res.error)
    }
    setLoading(false)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Seu Perfil Fiscal</h3>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Como você gera sua renda principal hoje?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'CLT', label: 'CLT / Empregado', desc: 'Trabalho com carteira assinada e imposto retido.' },
                { id: 'AUTONOMO', label: 'Autônomo / Freelancer', desc: 'Recebo de pessoas físicas ou exterior (Carnê-Leão).' },
                { id: 'SERVIDOR', label: 'Servidor Público', desc: 'Regime estatutário com previdência própria.' },
                { id: 'PJ', label: 'Empresário / PJ', desc: 'Recebo através de CNPJ (Pró-labore/Dividendos).' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, taxProfile: opt.id })}
                  style={{
                    padding: '16px', borderRadius: '16px', textAlign: 'left',
                    background: formData.taxProfile === opt.id ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${formData.taxProfile === opt.id ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{opt.label}</p>
                  <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Dependentes e Família</h3>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Isso ajuda a reduzir a base do seu imposto mensal.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Quantidade de Dependentes</label>
                <input 
                  type="number"
                  value={formData.taxDependents}
                  onChange={(e) => setFormData({ ...formData, taxDependents: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <p style={{ fontSize: '11px', color: '#71717a', marginTop: '6px' }}>Inclui filhos, enteados ou pais dependentes.</p>
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Pensão Alimentícia (Mensal)</label>
                <input 
                  type="number"
                  placeholder="R$ 0,00"
                  value={formData.taxPensionAmount || ''}
                  onChange={(e) => setFormData({ ...formData, taxPensionAmount: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <p style={{ fontSize: '11px', color: '#71717a', marginTop: '6px' }}>Valor pago mensalmente por decisão judicial.</p>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Deduções e Gastos</h3>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Detalhes para quem busca o máximo de eficiência.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => setFormData({ ...formData, taxPgblContribution: !formData.taxPgblContribution })}
                style={{
                  padding: '16px', borderRadius: '16px', textAlign: 'left',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${formData.taxPgblContribution ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <div>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Previdência Privada (PGBL)</p>
                  <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>Contribuo para abater até 12% da renda bruta.</p>
                </div>
                {formData.taxPgblContribution && <CheckCircle2 size={20} color="#ccff00" />}
              </button>

              {formData.taxProfile === 'AUTONOMO' && (
                <div>
                  <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Despesas Profissionais (Livro Caixa)</label>
                  <input 
                    type="number"
                    placeholder="R$ 0,00"
                    value={formData.taxBusinessExpenses || ''}
                    onChange={(e) => setFormData({ ...formData, taxBusinessExpenses: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <p style={{ fontSize: '11px', color: '#71717a', marginTop: '6px' }}>Aluguel de sala, internet e materiais para trabalhar.</p>
                </div>
              )}

              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.1)', display: 'flex', gap: '12px' }}>
                <Info size={18} color="#ccff00" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#ccff00', lineHeight: 1.4 }}>
                  <strong>Aviso:</strong> Em 2026, a Receita Federal aplica automaticamente o desconto simplificado se for mais vantajoso que as suas deduções.
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={24} /></button>
        
        <div style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', background: i <= step ? '#ccff00' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: 'all 0.3s' }} />
            ))}
          </div>

          {renderStep()}

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{ height: '56px', width: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <ChevronLeft size={24} color="#fff" />
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)}
                style={{ flex: 1, height: '56px', borderRadius: '16px', background: '#ccff00', color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                Continuar <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{ flex: 1, height: '56px', borderRadius: '16px', background: '#ccff00', color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Shield size={20} /> Salvar Configuração</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return <Calculator className={className} size={20} />
}
