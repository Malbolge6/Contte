'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getBillGroups() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.billGroup.findMany({
    where: { userId: session.user.id },
    include: {
      bills: {
        include: { documents: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createBillGroup(data: { name: string; color?: string; icon?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const group = await prisma.billGroup.create({
    data: {
      ...data,
      userId: session.user.id
    }
  })

  revalidatePath('/documentos')
  revalidatePath('/contas')
  return group
}

export async function deleteBillGroup(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.billGroup.delete({
    where: { id, userId: session.user.id }
  })

  revalidatePath('/documentos')
  revalidatePath('/contas')
}
