'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addDays, format, startOfDay } from 'date-fns'

export async function getBalancePrediction() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    // 1. Busca dados atuais
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        transactions: {
          orderBy: { date: 'desc' }
        },
        bills: {
          where: { status: 'PENDING' }
        }
      }
    })

    if (!user) return null

    // 2. Calcula Saldo Atual Real
    const totalIncome = user.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = user.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0)
    
    let currentBalance = totalIncome - totalExpense

    // 3. Projeção para os próximos 60 dias
    const projection = []
    const today = startOfDay(new Date())
    
    // Média de ganhos mensais baseada no histórico (simplificado)
    const monthlyIncome = user.transactions
      .filter(t => t.type === 'INCOME' && t.date > addDays(new Date(), -30))
      .reduce((acc, t) => acc + t.amount, 0) || 0

    for (let i = 0; i <= 60; i++) {
      const projectionDate = addDays(today, i)
      
      // Subtrai contas que vencem neste dia específico
      const billsThisDay = user.bills.filter(b => {
        const dueDate = new Date(b.dueDate)
        return dueDate.getDate() === projectionDate.getDate() && 
               dueDate.getMonth() === projectionDate.getMonth() &&
               dueDate.getFullYear() === projectionDate.getFullYear()
      })

      const totalBillsToday = billsThisDay.reduce((acc, b) => acc + b.amount, 0)
      currentBalance -= totalBillsToday

      // Simulação de entrada de salário (ex: todo dia 5 se houver histórico)
      if (projectionDate.getDate() === 5 && monthlyIncome > 0) {
        currentBalance += monthlyIncome
      }

      projection.push({
        date: format(projectionDate, 'dd/MM'),
        fullDate: projectionDate,
        balance: currentBalance,
        bills: totalBillsToday
      })
    }

    return projection
  } catch (error) {
    console.error('PREDICTION_ERROR:', error)
    return null
  }
}
