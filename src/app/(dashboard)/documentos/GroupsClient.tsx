'use client'

import { useState, useEffect } from 'react'
import { 
  Folder, UploadCloud, Plus, X, FileText, 
  Download, Trash2, Loader2, ChevronRight, 
  Search, Calendar, Filter, MoreVertical
} from 'lucide-react'
import { saveDocument, getDocuments, deleteDocument, createFolder, getFolders } from '@/actions/documents'
import { createPortal } from 'react-dom'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface Document {
  id: string
  name: string
  url: string
  type: string
  size: number
  referenceDate?: Date | string | null
  createdAt: Date | string
}

interface FolderType {
  id: string
  name: string
  documents: Document[]
}

export function GroupsClient() {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [refDate, setRefDate] = useState('')

  const [uploading, setUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  async function loadData() {
    try {
      const data = await getFolders()
      setFolders(data as any)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    if (!folderName.trim()) return
    setLoading(true)
    try {
      await createFolder(folderName)
      setFolderName('')
      setShowAddFolder(false)
      loadData()
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFolder || !fileUrl.trim()) return
    setUploading(true)
    try {
      await saveDocument({
        name: fileName,
        url: fileUrl,
        type: fileUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'jpg',
        size: 1024,
        folderId: selectedFolder.id,
        referenceDate: refDate ? new Date(refDate) : undefined
      })
      setFileName('')
      setFileUrl('')
      setRefDate('')
      setShowAddDoc(false)
      loadData()
      // Update selected folder view
      const updated = await getFolders()
      const found = updated.find(f => f.id === selectedFolder.id)
      if (found) setSelectedFolder(found as any)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>Comprovantes</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>Organize seus recibos por pastas.</p>
        </div>
        <button 
          onClick={() => setShowAddFolder(true)}
          style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'rgba(204, 255, 0, 0.1)', color: '#ccff00', 
            border: '1px solid rgba(204, 255, 0, 0.2)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
          }}
        >
          <Folder size={24} />
        </button>
      </div>

      {!selectedFolder ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {folders.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Folder size={48} color="#ccff00" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Nenhuma pasta ainda</h3>
              <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px' }}>Crie pastas como 'Sabesp' ou 'Aluguel' para organizar seus comprovantes.</p>
              <button onClick={() => setShowAddFolder(true)} className="btn-primary">Criar Pasta</button>
            </div>
          ) : (
            folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => setSelectedFolder(folder)}
                className="scale-in"
                style={{ 
                  padding: '24px', background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(204, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Folder size={24} color="#ccff00" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{folder.name}</h3>
                  <p style={{ fontSize: '12px', color: '#71717a' }}>{folder.documents.length} arquivos</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="fade-in">
          <button 
            onClick={() => setSelectedFolder(null)}
            style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#ccff00', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
            Voltar para pastas
          </button>
          
          <div style={{ marginBottom: '24px', padding: '24px', background: 'rgba(204, 255, 0, 0.1)', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{selectedFolder.name}</h2>
              <p style={{ fontSize: '13px', color: '#ccff00', fontWeight: 600 }}>{selectedFolder.documents.length} Comprovantes</p>
            </div>
            <button 
              onClick={() => setShowAddDoc(true)}
              style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ccff00', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Plus size={24} color="#000" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedFolder.documents.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#52525b', fontSize: '14px' }}>Nenhum comprovante nesta pasta.</p>
            ) : (
              selectedFolder.documents.map(doc => (
                <div key={doc.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#71717a" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{doc.name}</h4>
                    <p style={{ fontSize: '11px', color: '#52525b' }}>
                      {doc.referenceDate ? `Referente a: ${new Date(doc.referenceDate).toLocaleDateString('pt-BR')}` : 'Sem data de referência'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={async () => {
                        if(confirm('Excluir?')) {
                          await deleteDocument(doc.id)
                          const updated = await getFolders()
                          const found = updated.find(f => f.id === selectedFolder.id)
                          if (found) setSelectedFolder(found as any)
                          loadData()
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showAddFolder && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddFolder(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Nova Pasta</h2>
              <form onSubmit={handleCreateFolder}>
                <input 
                  type="text" className="input-field" placeholder="Ex: Sabesp, Internet, Aluguel" 
                  value={folderName} onChange={e => setFolderName(e.target.value)} required autoFocus
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : 'Criar Pasta'}
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showAddDoc && createPortal(
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddDoc(false)}>
          <div className="modal-content">
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', margin: '12px auto 0' }} />
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Novo Comprovante</h2>
              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>Nome do Arquivo</label>
                  <input 
                    type="text" className="input-field" placeholder="Ex: Conta de Luz Maio" 
                    value={fileName} onChange={e => setFileName(e.target.value)} required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>URL do Arquivo (Mock)</label>
                  <input 
                    type="text" className="input-field" placeholder="https://..." 
                    value={fileUrl} onChange={e => setFileUrl(e.target.value)} required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>Referente a (Data)</label>
                  <input 
                    type="date" className="input-field" 
                    value={refDate} onChange={e => setRefDate(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" /> : 'Salvar Comprovante'}
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
