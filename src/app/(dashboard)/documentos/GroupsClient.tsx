'use client'

import { useState } from 'react'
import { Folder, UploadCloud, Plus, X, FileText, Download, Trash2, ArrowRight } from 'lucide-react'
import { createBillGroup, deleteBillGroup } from '@/actions/groups'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface GroupsClientProps {
  groups: any[]
}

export function GroupsClient({ groups }: GroupsClientProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createBillGroup({ name, color: '#ccff00' })
      setShowAdd(false)
      setName('')
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este grupo?')) return
    await deleteBillGroup(id)
    setSelectedGroup(null)
    window.location.reload()
  }

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Meus Grupos
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
            Organize contas e comprovantes
          </p>
        </div>
        {!selectedGroup && (
          <button onClick={() => setShowAdd(true)} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        )}
      </div>

      {selectedGroup ? (
        <div className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => setSelectedGroup(null)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
              ← Voltar
            </button>
          </div>

          <div className="gradient-card-pink" style={{ padding: '24px', borderRadius: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selectedGroup.name}</h2>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>{selectedGroup.bills?.length || 0} contas vinculadas</p>
            <button onClick={() => handleDelete(selectedGroup.id)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.2)', border: 'none', width: '36px', height: '36px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={16} />
            </button>
          </div>

          <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <UploadCloud size={40} color="#ccff00" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Upload de Comprovante
            </h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa', marginBottom: '20px' }}>
              Anexe PDFs ou Imagens para este grupo
            </p>
            <button className="btn-accent" style={{ width: '100%' }}>Selecionar arquivo</button>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Comprovantes Salvos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map((mock) => (
              <div key={mock} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} color="#ccff00" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Comprovante_Maio.pdf</p>
                    <p style={{ fontSize: '12px', color: '#71717a' }}>Hoje · 124 KB</p>
                  </div>
                </div>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {groups.map(group => (
            <div 
              key={group.id} 
              onClick={() => setSelectedGroup(group)}
              style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Folder size={24} color={group.color || '#fff'} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{group.name}</h3>
              <p style={{ fontSize: '12px', color: '#71717a' }}>{group.bills?.length || 0} contas</p>
            </div>
          ))}

          {groups.length === 0 && !showAdd && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px' }}>
              <Folder size={40} color="#71717a" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Nenhum grupo</h3>
              <p style={{ fontSize: '14px', color: '#a1a1aa' }}>Crie grupos como Enel, Sabesp, Internet...</p>
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="modal-content">
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Novo Grupo</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Nome do Grupo (ex: Enel, Sabesp)</label>
                <input autoFocus type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="Nome..." style={{ marginBottom: '24px' }} />
                <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%' }}>
                  Criar Grupo
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
