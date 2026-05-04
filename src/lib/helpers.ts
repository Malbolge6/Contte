import { cn } from '@/lib/utils'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return '—'
  }
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(d)
  } catch {
    return '—'
  }
}

export function getDaysUntilDue(dueDate: Date | string | null | undefined): number {
  if (!dueDate) return 0
  try {
    const d = typeof dueDate === 'string' ? new Date(dueDate) : new Date(dueDate.getTime())
    if (isNaN(d.getTime())) return 0
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    const diff = d.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch {
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


