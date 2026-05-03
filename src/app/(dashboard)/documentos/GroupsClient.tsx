'use client'

import { useState, useEffect } from 'react'
import { Folder, UploadCloud, Plus, X, FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { createBillGroup, deleteBillGroup } from '@/actions/groups'
import { saveDocument, getDocuments, deleteDocument } from '@/actions/documents'
import { createPortal } from 'react-dom'

interface Document {
  id: string
  name: string
  url: string
  type: string
  size: number
  createdAt: Date
}

interface Group {
  id: string
  name: string
  color?: string | null
  bills?: any[]
}

interface GroupsClientProps {
  groups: Group[]
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function GroupsClient({ groups }: GroupsClientProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      loadDocuments()
    }
  }, [selectedGroup])

  async function loadDocuments() {
    try {
      const docs = await getDocuments(selectedGroup?.id)
      setDocuments(docs as Document[])
    } catch {
      setDocuments([])
    }
  }

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
    if (!confirm('Excluir este grupo e todos os seus comprovantes?')) return
    await deleteBillGroup(id)
    setSelectedGroup(null)
    window.location.reload()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo: 10MB')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('groupId', selectedGroup!.id)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Erro no upload')

      await saveDocument({
        name: result.name,
        url: result.url,
        type: result.type,
        size: result.size,
        billId: selectedGroup!.id,
      })

      await loadDocuments()
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar arquivo.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteDoc(docId: string, docUrl: string) {
    if (!confirm('Excluir este comprovante?')) return
    setDeletingDocId(docId)
    try {
      // Extract path from URL
      const path = docUrl.split('/comprovantes/')[1]
      if (path) {
        await supabase.storage.from('comprovantes').remove([path])
      }
      await deleteDocument(docId)
      await loadDocuments()
    } finally {
      setDeletingDocId(null)
    }
  }

  return (
    <div className="fade-in" style={{ paddingTop: '8px', paddingBottom: '80px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Comprovantes
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '14px', marginTop: '4px' }}>
            Arquivos e comprovantes por grupo
          </p>
        </div>
        {!selectedGroup && (
          <button
            onClick={() => setShowAdd(true)}
            style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {selectedGroup ? (
        <div className="fade-in">
          <button
            onClick={() => { setSelectedGroup(null); setDocuments([]) }}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
          >
            ← Voltar
          </button>

          {/* Group Header */}
          <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '1px solid rgba(204,255,0,0.15)', borderRadius: '24px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{selectedGroup.name}</h2>
            <p style={{ fontSize: '14px', color: '#a1a1aa' }}>{documents.length} comprovante(s)</p>
            <button
              onClick={() => handleDelete(selectedGroup.id)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', width: '36px', height: '36px', borderRadius: '12px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Upload Area */}
          <label
            htmlFor="file-upload"
            style={{
              display: 'block',
              background: uploading ? 'rgba(204,255,0,0.05)' : 'rgba(255,255,255,0.02)',
              border: '2px dashed rgba(204,255,0,0.3)',
              borderRadius: '20px',
              padding: '32px 24px',
              textAlign: 'center',
              marginBottom: '24px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <Loader2 size={36} color="#ccff00" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <UploadCloud size={36} color="#ccff00" style={{ margin: '0 auto 12px' }} />
            )}
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {uploading ? 'Enviando...' : 'Clique para selecionar arquivo'}
            </p>
            <p style={{ fontSize: '12px', color: '#71717a' }}>PDF, JPG, PNG — Máximo 10MB</p>
          </label>

          {uploadError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '13px' }}>
              ⚠️ {uploadError}
            </div>
          )}

          {/* Documents list */}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Comprovantes ({documents.length})
          </h3>

          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#71717a' }}>
              <FileText size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>Nenhum comprovante enviado ainda</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="#ccff00" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {doc.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#71717a' }}>{formatBytes(doc.size)} · {doc.type.toUpperCase()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', width: '34px', height: '34px', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      <Download size={15} />
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.url)}
                      disabled={deletingDocId === doc.id}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', width: '34px', height: '34px', borderRadius: '10px', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      {deletingDocId === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {groups.map(group => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Folder size={24} color="#ccff00" />
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

      {/* Add Group Modal */}
      {showAdd && mounted && createPortal(
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="modal-content">
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Novo Grupo</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#a1a1aa', marginBottom: '8px' }}>Nome do Grupo (ex: Enel, Sabesp)</label>
                <input
                  autoFocus
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Nome..."
                  style={{ marginBottom: '24px' }}
                />
                <button type="submit" disabled={loading} className="btn-accent" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Criar Grupo
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
