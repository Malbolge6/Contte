'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getWallets() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.wallet.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createWallet(data: {
  name: string
  type: string
  balance: number
  color?: string
  icon?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const wallet = await prisma.wallet.create({
    data: { ...data, userId: session.user.id },
  })

  revalidatePath('/carteiras')
  return wallet
}

export async function updateWallet(id: string, data: {
  name?: string
  type?: string
  balance?: number
  color?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const wallet = await prisma.wallet.update({
    where: { id, userId: session.user.id },
    data,
  })

  revalidatePath('/carteiras')
  return wallet
}

export async function deleteWallet(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.wallet.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/carteiras')
}
