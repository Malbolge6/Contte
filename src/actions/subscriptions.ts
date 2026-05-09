'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSubscriptions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  try {
    return await prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return []
  }
}

export async function upsertSubscription(data: { name: string, logo: string, amount: number, category: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        name: data.name
      }
    })

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          amount: data.amount,
          category: data.category,
          logo: data.logo
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          ...data,
          userId: session.user.id
        }
      })
    }

    revalidatePath('/assinaturas')
    return { success: true }
  } catch (error) {
    console.error('Error upserting subscription:', error)
    throw new Error('Failed to save subscription')
  }
}

export async function deleteSubscription(name: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    await prisma.subscription.deleteMany({
      where: {
        userId: session.user.id,
        name: name
      }
    })
    revalidatePath('/assinaturas')
    return { success: true }
  } catch (error) {
    console.error('Error deleting subscription:', error)
    throw new Error('Failed to delete subscription')
  }
}

export async function cancelSubscription() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    // In a real app, this would call Stripe to cancel. 
    // Here we just mark the user as basic in our DB for demonstration.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: 'FREE' }
    })
    revalidatePath('/dashboard')
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { success: false, error: 'Erro ao cancelar assinatura' }
  }
}
