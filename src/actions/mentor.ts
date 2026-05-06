'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getMentorInsight() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    // Busca dados essenciais para o "Cérebro"
    const [transactions, goals, accounts] = await Promise.all([
      prisma.transaction.findMany({ 
        where: { 
          userId: session.user.id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // Apenas este mês
          }
        } 
      }),
      prisma.goal.findMany({ where: { userId: session.user.id } }),
      prisma.bill.findMany({ where: { userId: session.user.id, status: 'PENDING' } })
    ])

    // Lógica do Cérebro (Análise de Dados)
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0)
    
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0)

    const balance = totalIncome - totalExpense
    const pendingBillsCount = accounts.length
    const pendingBillsTotal = accounts.reduce((acc, b) => acc + b.amount, 0)

    // Sistema de Regras Inteligentes
    let mood = 'neutral' // happy, neutral, warning, danger
    let title = 'Manuel Analisa...'
    let message = 'Tudo parece calmo por aqui. Continue registrando seus movimentos para que eu possa proteger seu futuro com precisão.'

    if (transactions.length === 0) {
       title = 'Bem-vindo ao Mentor'
       message = 'Ainda não tenho dados suficientes. Comece lançando seus ganhos e gastos deste mês!'
    } else if (balance < 0) {
      mood = 'danger'
      title = 'Alerta de Cuidado'
      message = 'Atenção! Suas despesas superaram seus ganhos este mês. É hora de parar, respirar e cortar gastos supérfluos imediatamente.'
    } else if (pendingBillsCount > 0 && balance < pendingBillsTotal) {
      mood = 'warning'
      title = 'Aviso de Manuel'
      message = `Notei que você tem R$ ${pendingBillsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em contas pendentes, mas o saldo não cobre tudo. Vamos priorizar o essencial?`
    } else if (totalExpense > totalIncome * 0.8 && totalIncome > 0) {
      mood = 'warning'
      title = 'Alerta de Ritmo'
      message = 'Você já comprometeu 80% da sua renda. Recomendo desacelerar os gastos nas próximas semanas para não perdermos o fôlego.'
    } else if (balance > totalIncome * 0.2 && goals.length > 0 && totalIncome > 0) {
      mood = 'happy'
      const mainGoal = goals[0].title
      title = 'Sabedoria Financeira'
      message = `Você está com uma ótima margem! Que tal dar um passo calmo e firme em direção à sua meta: "${mainGoal}"?`
    } else if (totalIncome > 0 && totalExpense < totalIncome * 0.5) {
      mood = 'happy'
      title = 'Ritmo de Elite'
      message = 'Você está gastando menos da metade do que ganha. Esse é o caminho mais rápido para a sua liberdade financeira!'
    }

    return { title, message, mood }
  } catch (error) {
    console.error('MENTOR_ERROR:', error)
    return null
  }
}
