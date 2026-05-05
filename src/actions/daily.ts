'use server'

import { createTimelineEvent } from './timeline'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function checkAndGenerateDailyUpdate() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  const userId = session.user.id
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentHour = new Date().getHours()
  let timeGreeting = 'Bom dia'
  let summaryTitle = 'Resumo Matinal ☕'
  
  if (currentHour >= 12 && currentHour < 18) {
    timeGreeting = 'Boa tarde'
    summaryTitle = 'Resumo da Tarde ☀️'
  } else if (currentHour >= 18) {
    timeGreeting = 'Boa noite'
    summaryTitle = 'Resumo da Noite 🌙'
  }

  // Check if already has any summary for today
  const existing = await prisma.timelineEvent.findFirst({
    where: {
      userId,
      title: { contains: 'Resumo' },
      createdAt: { gte: today }
    }
  })

  if (existing) return

  // Generate an update
  const overdueCount = await prisma.bill.count({
    where: { userId, status: 'PENDING', dueDate: { lt: new Date() } }
  })

  const billsToday = await prisma.bill.count({
    where: { 
      userId, 
      status: 'PENDING', 
      dueDate: { 
        gte: today, 
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
      } 
    }
  })

  if (billsToday > 0 || overdueCount > 0) {
    await createTimelineEvent({
      type: 'alert',
      title: summaryTitle,
      description: `${timeGreeting}! Hoje você tem ${billsToday} conta(s) vencendo ${overdueCount > 0 ? `e ${overdueCount} já atrasada(s)` : ''}. Vamos organizar isso?`,
    })
  } else {
    await createTimelineEvent({
      type: 'insight',
      title: summaryTitle,
      description: `${timeGreeting}! Nenhuma conta vencendo hoje. Dia perfeito para focar nas suas metas de economia!`,
    })
  }
}
