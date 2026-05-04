import { cn } from '@/lib/utils'

export function formatCurrency(value: number | null | undefined): string {
  const val = typeof value === 'number' ? value : 0
  if (isNaN(val)) return 'R$ 0,00'
  
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  } catch {
    return 'R$ 0,00'
  }
}

export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '')
  const amount = parseFloat(digits) / 100
  if (isNaN(amount)) return ''
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0
}

export function formatDate(date: any): string {
  if (!date) return '—'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch (err) {
    console.error('formatDate error:', err)
    return '—'
  }
}

export function formatDateShort(date: any): string {
  if (!date) return '—'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(d)
  } catch (err) {
    console.error('formatDateShort error:', err)
    return '—'
  }
}

export function getDaysUntilDue(dueDate: any): number {
  if (!dueDate) return 0
  try {
    const d = new Date(dueDate)
    if (isNaN(d.getTime())) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    const diff = d.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch (err) {
    console.error('getDaysUntilDue error:', err)
    return 0
  }
}

export function getBillStatusLabel(daysUntil: number): {
  label: string
  color: string
  urgent: boolean
} {
  if (daysUntil < 0) {
    return { label: `Vencida há ${Math.abs(daysUntil)} dia(s)`, color: 'text-red-400', urgent: true }
  } else if (daysUntil === 0) {
    return { label: 'Vence hoje!', color: 'text-orange-400', urgent: true }
  } else if (daysUntil <= 3) {
    return { label: `Vence em ${daysUntil} dia(s)`, color: 'text-yellow-400', urgent: true }
  } else {
    return { label: `Vence em ${daysUntil} dia(s)`, color: 'text-gray-400', urgent: false }
  }
}

export const CATEGORIES = [
  { value: 'moradia', label: 'Moradia', icon: '🏠' },
  { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'saude', label: 'Saúde', icon: '💊' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'lazer', label: 'Lazer', icon: '🎮' },
  { value: 'vestuario', label: 'Vestuário', icon: '👕' },
  { value: 'servicos', label: 'Serviços', icon: '⚙️' },
  { value: 'investimento', label: 'Investimento', icon: '📈' },
  { value: 'salario', label: 'Salário', icon: '💰' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'outros', label: 'Outros', icon: '📦' },
]

export const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'ted', label: 'TED/DOC' },
]


