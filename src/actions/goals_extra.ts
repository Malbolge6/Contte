'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTimelineEvent } from './timeline'

export async function addGoalContribution(data: {
  goalId: string
  amount: number
  type: 'ADD' | 'SUBTRACT'
  walletId?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const goal = await prisma.goal.findFirst({
    where: { id: data.goalId, userId: session.user.id }
  })

  if (!goal) throw new Error('Meta não encontrada')

  let walletName = ''
  if (data.walletId) {
    const wallet = await prisma.wallet.findFirst({
      where: { id: data.walletId, userId: session.user.id }
    })
    if (wallet) {
      walletName = wallet.name
      // Update wallet balance if it's an investment or savings wallet
      await prisma.wallet.update({
        where: { id: data.walletId },
        data: {
          balance: {
            decrement: data.type === 'ADD' ? data.amount : -data.amount
          }
        }
      })
    }
  }

  // Update goal current amount
  const newAmount = data.type === 'ADD' 
    ? goal.currentAmount + data.amount 
    : Math.max(0, goal.currentAmount - data.amount)

  await prisma.goal.update({
    where: { id: data.goalId },
    data: { currentAmount: newAmount }
  })

  // Log contribution
  await prisma.goalContribution.create({
    data: {
      goalId: data.goalId,
      amount: data.amount,
      type: data.type,
      walletId: data.walletId,
      walletName: walletName
    }
  })

  // Timeline Event
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount)
  
  let percentText = ''
  let isJustFinished = false
  if (goal.targetAmount && goal.targetAmount > 0) {
    const oldPercent = Math.floor((goal.currentAmount / goal.targetAmount) * 100)
    const newPercent = Math.floor((newAmount / goal.targetAmount) * 100)
    percentText = ` Sua meta agora está em ${newPercent}%!`
    if (oldPercent < 100 && newPercent >= 100) isJustFinished = true
  }

  if (isJustFinished) {
    await createTimelineEvent({
      type: 'goal',
      title: 'Meta Batida! 🏆🎉',
      description: `INCRÍVEL! Você atingiu 100% da meta "${goal.name}". Todo o esforço valeu a pena!`,
    })
  } else {
    await createTimelineEvent({
      type: 'goal',
      title: data.type === 'ADD' ? 'Aporte na Meta! 🎯' : 'Resgate da Meta 💸',
      description: data.type === 'ADD'
        ? `Você guardou ${formattedAmount} para a meta "${goal.name}" ${walletName ? `vindo do ${walletName}` : ''}.${percentText}`
        : `Você retirou ${formattedAmount} da meta "${goal.name}".`,
    })
  }

  revalidatePath('/metas')
  revalidatePath('/timeline')
  revalidatePath('/dashboard')
  revalidatePath('/carteiras')
}

export async function getGoalContributions(goalId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.goalContribution.findMany({
    where: { goalId },
    orderBy: { date: 'desc' }
  })
}
