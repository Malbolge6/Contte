'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getTransactions(params?: {
  type?: string
  category?: string

  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const where: any = { userId: session.user.id }

  if (params?.type) where.type = params.type
  if (params?.category) where.category = params.category

  if (params?.startDate || params?.endDate) {
    where.date = {}
    if (params.startDate) where.date.gte = params.startDate
    if (params.endDate) where.date.lte = params.endDate
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: params?.limit,
  })
}

import { createTimelineEvent } from './timeline'

export async function createTransaction(data: {
  amount: number
  type: string
  category: string
  description: string
  date: Date
  paymentMethod?: string
  installments?: number
  notes?: string
  billId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount)

  if (data.installments && data.installments > 1) {
    const transactions = []
    const installmentAmount = data.amount / data.installments
    const baseDate = new Date(data.date)

    for (let i = 0; i < data.installments; i++) {
      const installmentDate = new Date(baseDate)
      installmentDate.setMonth(installmentDate.getMonth() + i)

      transactions.push(
        prisma.transaction.create({
          data: {
            ...data,
            amount: installmentAmount,
            date: installmentDate,
            installments: i + 1,
            totalInstallments: data.installments,
            description: `${data.description} (${i + 1}/${data.installments})`,
            userId: session.user.id,
          },
        })
      )
    }
    await prisma.$transaction(transactions)
    
    await createTimelineEvent({
      type: data.type === 'INCOME' ? 'income' : 'expense',
      title: data.type === 'INCOME' ? 'Entrada parcelada' : 'Gasto parcelado',
      description: `Você registrou ${data.description} em ${data.installments}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentAmount)}`,
      amount: data.amount,
      category: data.category
    })
  } else {
    await prisma.transaction.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    // Create Timeline Event
    await createTimelineEvent({
      type: data.type === 'INCOME' ? 'income' : 'expense',
      title: data.type === 'INCOME' ? 'Nova entrada 💰' : 'Novo gasto 💸',
      description: data.type === 'INCOME' 
        ? `Você recebeu ${formattedAmount} de ${data.description}`
        : `Você gastou ${formattedAmount} no ${data.description}`,
      amount: data.amount,
      category: data.category
    })

    // Smart Logic: Detect high spending in category
    if (data.type === 'EXPENSE') {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const categoryTotal = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          category: data.category,
          type: 'EXPENSE',
          date: { gte: startOfMonth }
        },
        _sum: { amount: true }
      })

      const total = categoryTotal._sum.amount || 0
      if (total > 500 && data.amount > 100) { // Simple threshold for demo
        await createTimelineEvent({
          type: 'alert',
          title: 'Gasto acima da média 👀',
          description: `Seus gastos com ${data.category} estão crescendo rápido este mês. Já somam ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}.`,
          category: data.category
        })
      }

      // Detect repetitions (e.g. iFood)
      if (data.description.toLowerCase().includes('ifood') || data.description.toLowerCase().includes('uber')) {
        const repetitions = await prisma.transaction.count({
          where: {
            userId: session.user.id,
            description: { contains: data.description, mode: 'insensitive' },
            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
          }
        })

        if (repetitions >= 3) {
          await createTimelineEvent({
            type: 'insight',
            title: 'Padrão detectado 📊',
            description: `Você usou ${data.description} ${repetitions} vezes nos últimos 7 dias. Que tal economizar um pouco aqui?`,
            category: data.category
          })
        }
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/transacoes')
  revalidatePath('/timeline')
}

export async function deleteTransaction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.transaction.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/dashboard')
  revalidatePath('/transacoes')
}

export async function getDashboardData() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [currentMonthTx, lastMonthTx, pendingBills, overdueBills, goals, wallets] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.bill.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        dueDate: { gte: now },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    prisma.bill.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.goal.findMany({
      where: { userId: session.user.id }
    }),
    prisma.wallet.findMany({
      where: { userId: session.user.id }
    })
  ])

  const walletBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  const currentIncome = currentMonthTx
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const currentExpense = currentMonthTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const lastIncome = lastMonthTx
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const lastExpense = lastMonthTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  // Category breakdown for pie chart
  const categoryBreakdown = currentMonthTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  // Monthly evolution (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const monthTx = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: start, lte: end },
      },
    })
    const income = monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    monthlyData.push({
      month: start.toLocaleDateString('pt-BR', { month: 'short' }),
      income,
      expense,
    })
  }

  return {
    balance: walletBalance,
    currentIncome,
    currentExpense,
    lastIncome,
    lastExpense,
    expenseChange: lastExpense > 0 ? ((currentExpense - lastExpense) / lastExpense) * 100 : 0,
    pendingBills,
    overdueBills,
    categoryBreakdown,
    monthlyData,
    recentTransactions: currentMonthTx.slice(0, 5),
    goals,
    wallets,
  }
}
