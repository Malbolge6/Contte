'use client'

import { useState, useEffect } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Shield, 
  Users, Heart, Briefcase, Calculator,
  CheckCircle2, Info, ArrowRight, HelpCircle
} from 'lucide-react'
import { updateTaxProfile, getTaxProfile } from '@/actions/tax'
import { formatCurrency } from '@/lib/helpers'
import { createPortal } from 'react-dom'

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

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  if (!mounted) return null

  const handleSave = async () => {
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

  const handleNumChange = (field: string, val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleaned) || 0
    setFormData({ ...formData, [field]: num })
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={20} color="#ccff00" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Perfil Profissional</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Para calcular o imposto correto, precisamos saber sua fonte de renda principal em 2026.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'CLT', label: 'CLT / Carteira Assinada', desc: 'Imposto retido mensalmente pela empresa.' },
                { id: 'AUTONOMO', label: 'Autônomo / Pessoa Física', desc: 'Recebe de pessoas físicas (freelas, etc).' },
                { id: 'PJ', label: 'Empresário / PJ', desc: 'Pró-labore ou Dividendos da empresa.' },
                { id: 'SERVIDOR', label: 'Servidor Público', desc: 'Regime estatutário / Previdência própria.' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, taxProfile: opt.id })}
                  style={{
                    padding: '16px', borderRadius: '18px', textAlign: 'left',
                    background: formData.taxProfile === opt.id ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${formData.taxProfile === opt.id ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: formData.taxProfile === opt.id ? '#ccff00' : '#fff', fontSize: '15px', fontWeight: 700 }}>{opt.label}</p>
                    <p style={{ color: '#71717a', fontSize: '12px', marginTop: '2px' }}>{opt.desc}</p>
                  </div>
                  {formData.taxProfile === opt.id && <CheckCircle2 size={18} color="#ccff00" />}
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#ccff00" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Família e Dependentes</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>Filhos ou dependentes legais garantem abatimento direto na base de cálculo.</p>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ display: 'block', color: '#a1a1aa', fontSize: '13px', marginBottom: '12px', fontWeight: 600 }}>NÚMERO DE DEPENDENTES</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                  onClick={() => setFormData({ ...formData, taxDependents: Math.max(0, formData.taxDependents - 1) })}
                  style={{ width: '48px', height: '48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
                >-</button>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#ccff00', flex: 1, textAlign: 'center' }}>{formData.taxDependents}</span>
                <button 
                  onClick={() => setFormData({ ...formData, taxDependents: formData.taxDependents + 1 })}
                  style={{ width: '48px', height: '48px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
                >+</button>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={20} color="#ccff00" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Deduções Especiais</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>PENSÃO ALIMENTÍCIA MENSAL (OPCIONAL)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontWeight: 700 }}>R$</span>
                  <input 
                    type="text" placeholder="0,00"
                    value={formData.taxPensionAmount === 0 ? '' : formData.taxPensionAmount}
                    onChange={(e) => handleNumChange('taxPensionAmount', e.target.value)}
                    style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px', fontWeight: 600 }}
                  />
                </div>
              </div>

              {formData.taxProfile === 'AUTONOMO' && (
                <div className="fade-in">
                  <label style={{ display: 'block', color: '#a1a1aa', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>DESPESAS LIVRO CAIXA (ALUGUEL, LUZ, ETC)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontWeight: 700 }}>R$</span>
                    <input 
                      type="text" placeholder="0,00"
                      value={formData.taxBusinessExpenses === 0 ? '' : formData.taxBusinessExpenses}
                      onChange={(e) => handleNumChange('taxBusinessExpenses', e.target.value)}
                      style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '16px', fontWeight: 600 }}
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={() => setFormData({ ...formData, taxPgblContribution: !formData.taxPgblContribution })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px',
                  background: formData.taxPgblContribution ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${formData.taxPgblContribution ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #ccff00', display: 'flex', alignItems: 'center', justifyContent: 'center', background: formData.taxPgblContribution ? '#ccff00' : 'transparent' }}>
                  {formData.taxPgblContribution && <CheckCircle2 size={14} color="#000" />}
                </div>
                <div>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Tenho Previdência PGBL</p>
                  <p style={{ color: '#71717a', fontSize: '11px' }}>Abate até 12% da renda bruta anual.</p>
                </div>
              </button>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Shield size={32} color="#ccff00" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Tudo Pronto!</h3>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              Com base no seu perfil de <strong>{formData.taxProfile}</strong>, o Contte agora calculará seu imposto seguindo as tabelas oficiais de 2026.
            </p>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#71717a', fontSize: '13px' }}>Dependentes</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{formData.taxDependents}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#71717a', fontSize: '13px' }}>PGBL</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{formData.taxPgblContribution ? 'Sim' : 'Não'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#71717a', fontSize: '13px' }}>Pensão</span>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{formatCurrency(formData.taxPensionAmount)}</span>
              </div>
            </div>
          </div>
        )
    }
  }

  return createPortal(
    <div style={{ 
      position: 'fixed', inset: 0, 
      background: 'rgba(0,0,0,0.85)', 
      backdropFilter: 'blur(10px)', 
      zIndex: 9999, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      padding: '16px' 
    }} onClick={onClose}>
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
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '20px', right: '20px', 
            background: 'rgba(255,255,255,0.05)', borderRadius: '50%', 
            width: '36px', height: '36px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10 
          }}
        >
          <X size={18} />
        </button>
        
        <div style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', background: i <= step ? '#ccff00' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: 'all 0.4s ease' }} />
            ))}
          </div>

          <div style={{ minHeight: '340px' }}>
            {renderStep()}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{ 
                  height: '56px', width: '56px', borderRadius: '18px', 
                  background: 'rgba(255,255,255,0.05)', border: 'none', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                }}
              >
                <ChevronLeft size={22} color="#fff" />
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                style={{ 
                  flex: 1, height: '56px', borderRadius: '18px', 
                  background: '#ccff00', color: '#000', fontSize: '15px', fontWeight: 800, 
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' 
                }}
              >
                Próximo Passo <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{ 
                  flex: 1, height: '56px', borderRadius: '18px', 
                  background: '#ccff00', color: '#000', fontSize: '15px', fontWeight: 800, 
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', 
                  opacity: loading ? 0.6 : 1 
                }}
              >
                {loading ? <Calculator className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Finalizar</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
