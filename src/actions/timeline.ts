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
