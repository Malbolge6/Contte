'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getTimelineEvents(limit = 20, skip = 0) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.timelineEvent.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: skip,
  })
}

export async function createTimelineEvent(data: {
  type: 'expense' | 'income' | 'alert' | 'insight' | 'goal'
  title: string
  description: string
  amount?: number
  category?: string
  metadata?: any
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const event = await prisma.timelineEvent.create({
    data: {
      ...data,
      userId: session.user.id
    }
  })

  revalidatePath('/timeline')
  return event
}

const TIPS = [
  "💡 Sabia que anotar seus gastos pequenos pode salvar até 15% do seu orçamento no fim do mês?",
  "🎯 Meta do dia: Tente passar hoje sem abrir apps de delivery. Sua carteira agradece!",
  "📊 Insights: O início do mês é o melhor momento para definir seu teto de gastos por categoria.",
  "🚀 Dica Premium: Use a aba 'Carteiras' para ver o saldo real somado de todos os seus bancos.",
  "💸 Evite compras por impulso: Espere 24 horas antes de fechar aquele carrinho online.",
]

export async function generateDailyTip() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
  return await createTimelineEvent({
    type: 'insight',
    title: 'Dica do dia 💡',
    description: tip,
  })
}

export async function backfillTimeline() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  // Check if already has events (don't duplicate backfill)
  const count = await prisma.timelineEvent.count({ where: { userId: session.user.id } })
  if (count > 5) return { skipped: true }

  const userId = session.user.id

  // 1. Welcome Event
  await prisma.timelineEvent.create({
    data: {
      userId,
      type: 'insight',
      title: 'Bem-vindo ao Feed do Contte! 👋',
      description: 'Aqui você verá tudo o que acontece com seu dinheiro em tempo real. Insights, alertas e conquistas aparecem aqui.',
    }
  })

  // 2. Historical Insights
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: last30Days } },
    orderBy: { amount: 'desc' }
  })

  if (transactions.length > 0) {
    // Highest Expense
    const highest = transactions.find(t => t.type === 'EXPENSE')
    if (highest) {
      await prisma.timelineEvent.create({
        data: {
          userId,
          type: 'alert',
          title: 'Análise de Histórico 🔍',
          description: `Nos últimos 30 dias, seu maior gasto registrado foi "${highest.description}" no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(highest.amount)}.`,
          amount: highest.amount,
          category: highest.category
        }
      })
    }

    // Total Income
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    if (income > 0) {
      await prisma.timelineEvent.create({
        data: {
          userId,
          type: 'income',
          title: 'Balanço Mensal 💰',
          description: `Você já recebeu um total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)} neste último mês. Bom trabalho!`,
          amount: income
        }
      })
    }
  }

  // 3. Overdue Bills Alert
  const overdueCount = await prisma.bill.count({
    where: { userId, status: 'PENDING', dueDate: { lt: new Date() } }
  })

  if (overdueCount > 0) {
    await prisma.timelineEvent.create({
      data: {
        userId,
        type: 'alert',
        title: 'Atenção às Contas! ⚠️',
        description: `Você tem ${overdueCount} conta(s) atrasada(s). Resolva isso para evitar juros!`,
      }
    })
  }

  // 4. Goals Progress
  const goals = await prisma.goal.findMany({ where: { userId } })
  for (const goal of goals) {
    if (goal.targetAmount && goal.currentAmount > 0) {
      const percent = Math.floor((goal.currentAmount / goal.targetAmount) * 100)
      if (percent >= 10) {
        await prisma.timelineEvent.create({
          data: {
            userId,
            type: 'goal',
            title: `Progresso na Meta: ${goal.name} 🎯`,
            description: `Você já atingiu ${percent}% da sua meta de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.targetAmount)}! Continue assim.`,
          }
        })
      }
    }
  }

  // 5. Initial Tip
  await generateDailyTip()

  revalidatePath('/timeline')
  return { success: true }
}
