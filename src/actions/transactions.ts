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

  if (data.installments && data.installments > 1) {
    // Create multiple installments
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
  } else {
    await prisma.transaction.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/transacoes')
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

  const [currentMonthTx, lastMonthTx, pendingBills, overdueBills, goals] = await Promise.all([
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
    })
  ])

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
    balance: currentIncome - currentExpense,
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
  }
}
