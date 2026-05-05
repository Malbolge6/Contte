'use client'

import { useState, useEffect } from 'react'
import { 
  X, ChevronRight, ChevronLeft, Shield, 
  Users, Heart, Briefcase, Calculator,
  CheckCircle2, Info, ArrowRight, HelpCircle
} from 'lucide-react'
import { updateTaxProfile, getTaxProfile } from '@/actions/tax'
import { formatCurrency } from '@/lib/helpers'

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

  // Corrigindo o bug do input: Se for 0, mostra vazio para facilitar digitação
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
              <Briefcase size={24} color="#ccff00" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Perfil Profissional</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Para calcular o imposto correto, precisamos saber sua fonte de renda principal em 2026.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'CLT', label: 'CLT / Carteira Assinada', desc: 'Seu imposto é retido mensalmente pela empresa.' },
                { id: 'AUTONOMO', label: 'Autônomo / Pessoa Física', desc: 'Você recebe de pessoas físicas (ex: médicos, freelas).' },
                { id: 'PJ', label: 'Empresário / PJ', desc: 'Sua renda vem de Pró-labore ou Dividendos da sua empresa.' },
                { id: 'SERVIDOR', label: 'Servidor Público', desc: 'Regime estatutário com regras específicas de previdência.' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, taxProfile: opt.id })}
                  style={{
                    padding: '16px', borderRadius: '20px', textAlign: 'left',
                    background: formData.taxProfile === opt.id ? 'rgba(204, 255, 0, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${formData.taxProfile === opt.id ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: formData.taxProfile === opt.id ? '#ccff00' : '#fff', fontSize: '15px', fontWeight: 700 }}>{opt.label}</p>
                    <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>{opt.desc}</p>
                  </div>
                  {formData.taxProfile === opt.id && <CheckCircle2 size={20} color="#ccff00" />}
                </button>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Users size={24} color="#ccff00" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Família e Deduções</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Dependentes e pensões reduzem legalmente o valor do seu imposto.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Quantidade de Dependentes</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setFormData({...formData, taxDependents: Math.max(0, formData.taxDependents - 1)})} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}>-</button>
                  <input 
                    type="number"
                    value={formData.taxDependents || ''}
                    placeholder="0"
                    onChange={(e) => handleNumChange('taxDependents', e.target.value)}
                    style={{ flex: 1, textAlign: 'center', background: 'none', border: 'none', color: '#ccff00', fontSize: '24px', fontWeight: 800 }}
                  />
                  <button onClick={() => setFormData({...formData, taxDependents: formData.taxDependents + 1})} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#fff', cursor: 'pointer' }}>+</button>
                </div>
                <p style={{ fontSize: '11px', color: '#71717a', textAlign: 'center', marginTop: '12px' }}>Filhos, pais ou companheiros que dependem de você.</p>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Paga Pensão Alimentícia?</label>
                <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px' }}>O valor integral da pensão judicial abate o seu imposto.</p>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontWeight: 700 }}>R$</span>
                  <input 
                    type="number"
                    placeholder="0,00"
                    value={formData.taxPensionAmount || ''}
                    onChange={(e) => handleNumChange('taxPensionAmount', e.target.value)}
                    style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Heart size={24} color="#ccff00" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Detalhes Específicos</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Perguntas baseadas no seu perfil de <strong>{formData.taxProfile}</strong>.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => setFormData({ ...formData, taxPgblContribution: !formData.taxPgblContribution })}
                style={{
                  padding: '20px', borderRadius: '20px', textAlign: 'left',
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${formData.taxPgblContribution ? '#ccff00' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}
              >
                <div>
                  <p style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>Previdência PGBL</p>
                  <p style={{ color: '#71717a', fontSize: '12px', marginTop: '4px' }}>Você contribui para previdência privada tipo PGBL?</p>
                </div>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #ccff00', background: formData.taxPgblContribution ? '#ccff00' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {formData.taxPgblContribution && <CheckCircle2 size={16} color="#000" />}
                </div>
              </button>

              {formData.taxProfile === 'AUTONOMO' ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Livro Caixa (Despesas do Trabalho)</label>
                  <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '16px' }}>Aluguel de sala, internet e materiais para exercer sua profissão.</p>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#71717a', fontWeight: 700 }}>R$</span>
                    <input 
                      type="number"
                      placeholder="0,00"
                      value={formData.taxBusinessExpenses || ''}
                      onChange={(e) => handleNumChange('taxBusinessExpenses', e.target.value)}
                      style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '16px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', fontWeight: 700 }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(204, 255, 0, 0.05)', border: '1px solid rgba(204, 255, 0, 0.1)', display: 'flex', gap: '12px' }}>
                  <Info size={20} color="#ccff00" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#ccff00', lineHeight: 1.5 }}>
                    Para o perfil <strong>{formData.taxProfile}</strong>, despesas de trabalho não abatem imposto de renda pessoa física, apenas no ajuste anual via CNPJ se houver.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={24} color="#ccff00" />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Resumo e Revisão</h3>
            </div>
            <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '24px' }}>Veja como o Contte vai monitorar seus impostos agora.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Sua Tributação</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{formData.taxProfile}</p>
                  <p style={{ color: '#ccff00', fontSize: '12px', fontWeight: 600 }}>Tabela Progressiva 2026</p>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Benefício Fiscal</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <p style={{ color: '#fff', fontSize: '14px' }}>Dependentes: {formData.taxDependents}</p>
                  <p style={{ color: '#34d399', fontSize: '12px', fontWeight: 600 }}>- {formatCurrency(formData.taxDependents * 189.59)} base/mês</p>
                </div>
                {formData.taxPensionAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <p style={{ color: '#fff', fontSize: '14px' }}>Pensão Alimentícia</p>
                    <p style={{ color: '#34d399', fontSize: '12px', fontWeight: 600 }}>- {formatCurrency(formData.taxPensionAmount)} base/mês</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '12px', color: '#71717a', lineHeight: 1.5, textAlign: 'center' }}>
                  Ao salvar, o Contte calculará seu imposto em tempo real no Dashboard baseado nas suas entradas mensais.
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10 }}><X size={20} /></button>
        
        <div style={{ padding: '40px 24px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', background: i <= step ? '#ccff00' : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            ))}
          </div>

          <div style={{ minHeight: '380px' }}>
            {renderStep()}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                style={{ height: '60px', width: '60px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <ChevronLeft size={24} color="#fff" />
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                style={{ flex: 1, height: '60px', borderRadius: '20px', background: '#ccff00', color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                Próximo Passo <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{ flex: 1, height: '60px', borderRadius: '20px', background: '#ccff00', color: '#000', fontSize: '16px', fontWeight: 800, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: 'transform 0.2s' }}
              >
                {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Finalizar Configuração</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return <Calculator className={className} size={24} />
}
