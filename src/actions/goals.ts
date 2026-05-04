'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { createTimelineEvent } from './timeline'

export async function getGoals() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createGoal(data: {
  name: string
  category: string
  limitAmount?: number
  targetAmount?: number
  type: string
  period?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const goal = await prisma.goal.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  await createTimelineEvent({
    type: 'goal',
    title: 'Nova Meta Definida! 🎯',
    description: `Você acaba de definir a meta "${data.name}". Vamos trabalhar juntos para conquistar esse objetivo!`,
  })

  revalidatePath('/metas')
  revalidatePath('/timeline')
}

export async function updateGoal(id: string, data: Partial<{
  name: string
  category: string
  limitAmount: number
  targetAmount: number
  currentAmount: number
  period: string
}>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data,
  })

  revalidatePath('/metas')
}

export async function deleteGoal(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.goal.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/metas')
}
