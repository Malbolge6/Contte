'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateHourlyRate(rate: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Não autorizado')

    await prisma.user.update({
      where: { id: session.user.id },
      data: { hourlyRate: rate }
    })

    revalidatePath('/configuracoes')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('UPDATE_HOURLY_RATE_ERROR:', error)
    return { success: false, error: 'Falha ao atualizar valor da hora' }
  }
}
