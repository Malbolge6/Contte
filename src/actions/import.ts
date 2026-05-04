'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTransaction } from './transactions'
import { createTimelineEvent } from './timeline'

// Smart classification rules
const RULES = [
  { keywords: ['uber', '99app', 'cabify', 'posto', 'gasolina', 'shell', 'ipiranga'], category: 'Transporte' },
  { keywords: ['ifood', 'rappi', 'restaurante', 'mcdonalds', 'burguer king', 'pizza', 'padaria'], category: 'Alimentação' },
  { keywords: ['mercado', 'supermercado', 'carrefour', 'extra', 'pao de acucar', 'atacadao'], category: 'Mercado' },
  { keywords: ['salario', 'recebimento', 'pix recebido', 'transferencia recebida'], category: 'Receita' },
  { keywords: ['aluguel', 'condominio', 'luz', 'enel', 'agua', 'sabesp', 'internet', 'claro', 'vivo'], category: 'Contas Fixas' },
  { keywords: ['netflix', 'spotify', 'amazon', 'hbo', 'disney'], category: 'Assinaturas' },
  { keywords: ['farmacia', 'droga raia', 'drogasil', 'hospital', 'medico'], category: 'Saúde' },
]

function classifyDescription(description: string) {
  const lowerDesc = description.toLowerCase()
  for (const rule of RULES) {
    if (rule.keywords.some(k => lowerDesc.includes(k))) {
      return rule.category
    }
  }
  return 'Outros'
}

export async function processImportedData(transactions: any[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  let createdCount = 0
  let skippedCount = 0

  for (const tx of transactions) {
    const txDate = new Date(tx.date)
    
    // Check for duplicates (date + amount + description)
    const existing = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        amount: tx.amount,
        description: tx.description,
        date: txDate,
      }
    })

    if (existing) {
      skippedCount++
      continue
    }

    // Auto classify if not provided
    const category = tx.category || classifyDescription(tx.description)

    await prisma.transaction.create({
      data: {
        amount: Math.abs(tx.amount),
        type: tx.amount > 0 ? 'INCOME' : 'EXPENSE',
        category,
        description: tx.description,
        date: txDate,
        userId: session.user.id
      }
    })
    createdCount++
  }

  if (createdCount > 0) {
    await createTimelineEvent({
      type: 'insight',
      title: 'Importação concluída 📥',
      description: `Processamos seu extrato e organizamos ${createdCount} novas transações automaticamente. ${skippedCount > 0 ? `${skippedCount} duplicadas foram ignoradas.` : ''}`,
    })
  }

  return { createdCount, skippedCount }
}
