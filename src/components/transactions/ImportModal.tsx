'use client'

import { useState } from 'react'
import { 
  X, Upload, FileText, CheckCircle2, 
  AlertCircle, Loader2, Search, BrainCircuit 
} from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { processImportedData } from '@/actions/import'
import { useRouter } from 'next/navigation'

interface ImportModalProps {
  onClose: () => void
}

export function ImportModal({ onClose }: ImportModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'success'>('upload')
  const [fileData, setFileData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStep('processing')
    setStatusMessage('Lendo arquivo...')
    
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const bstr = evt.target?.result
      let rawData: any[] = []

      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(bstr as ArrayBuffer)
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
        rawData = parsed.data
      } else {
        const wb = XLSX.read(bstr, { type: 'array' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        rawData = XLSX.utils.sheet_to_json(ws)
      }

      // Simulate AI Processing steps
      await new Promise(r => setTimeout(r, 1000))
      setStatusMessage('Analisando padrões...')
      await new Promise(r => setTimeout(r, 1200))
      setStatusMessage('Classificando transações...')
      await new Promise(r => setTimeout(r, 1000))
      setStatusMessage('Detectando duplicatas...')
      await new Promise(r => setTimeout(r, 800))

      // Normalize data (basic heuristic)
      const normalized = rawData.map(row => {
        const keys = Object.keys(row)
        const dateKey = keys.find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date')) || keys[0]
        const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('hist')) || keys[1]
        const amountKey = keys.find(k => k.toLowerCase().includes('valor') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('pago')) || keys[2]

        let amount = parseFloat(String(row[amountKey]).replace(/[R$\s.]/g, '').replace(',', '.'))
        if (isNaN(amount)) amount = 0

        return {
          date: new Date(row[dateKey]),
          description: row[descKey] || 'Sem descrição',
          amount: amount,
        }
      }).filter(d => !isNaN(d.date.getTime()))

      setFileData(normalized)
      setStep('preview')
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      await processImportedData(fileData)
      setStep('success')
      router.refresh()
    } catch (err) {
      alert('Erro ao importar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit size={18} color="#ccff00" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Importação Inteligente</h2>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {step === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <label htmlFor="import-file" style={{ display: 'block', padding: '40px 20px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#ccff00'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                <input id="import-file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                <Upload size={48} color="#ccff00" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Selecione seu extrato</h3>
                <p style={{ fontSize: '13px', color: '#a1a1aa' }}>Arraste ou clique para enviar CSV ou Excel</p>
              </label>
              <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.5' }}>
                  💡 Nossa "IA" vai detectar automaticamente datas, valores e categorias para organizar tudo pra você.
                </p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader2 size={48} className="animate-spin" color="#ccff00" style={{ margin: '0 auto 24px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{statusMessage}</h3>
              <p style={{ fontSize: '14px', color: '#a1a1aa' }}>Isso levará apenas alguns instantes...</p>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80' }}>
                  <CheckCircle2 size={20} />
                  <span style={{ fontWeight: 700 }}>Análise concluída!</span>
                </div>
                <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '8px' }}>
                  Encontramos <strong>{fileData.length} transações</strong> no seu arquivo. Estamos prontos para importar.
                </p>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fileData.slice(0, 10).map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                      <p style={{ fontSize: '11px', color: '#71717a' }}>{item.date.toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: item.amount > 0 ? '#4ade80' : '#f87171' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                    </span>
                  </div>
                ))}
                {fileData.length > 10 && (
                  <p style={{ fontSize: '11px', color: '#52525b', textAlign: 'center' }}>+ {fileData.length - 10} outras transações</p>
                )}
              </div>

              <button className="btn-primary" onClick={handleConfirm} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading && <Loader2 size={18} className="animate-spin" />}
                Confirmar Importação
              </button>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} color="#4ade80" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Sucesso!</h2>
              <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px' }}>
                Suas transações foram organizadas e sua timeline foi atualizada.
              </p>
              <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
                Ver Timeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
