'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTimelineEvent } from './timeline'

export async function saveDocument(data: {
  name: string
  url: string
  type: string
  size: number
  billId?: string
  folderId?: string
  referenceDate?: Date
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const doc = await prisma.document.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  await createTimelineEvent({
    type: 'insight',
    title: 'Comprovante Armazenado 📂',
    description: `O documento "${data.name}" foi salvo com sucesso em sua biblioteca de arquivos.`,
  })

  revalidatePath('/documentos')
  revalidatePath('/timeline')
  return doc
}

export async function createFolder(name: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const folder = await prisma.documentFolder.create({
    data: {
      name,
      userId: session.user.id
    }
  })

  revalidatePath('/documentos')
  return folder
}

export async function getFolders() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.documentFolder.findMany({
    where: { userId: session.user.id },
    include: { documents: true }
  })
}

export async function getDocuments(params?: { billId?: string; folderId?: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  return await prisma.document.findMany({
    where: {
      userId: session.user.id,
      ...(params?.billId ? { billId: params.billId } : {}),
      ...(params?.folderId ? { folderId: params.folderId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteDocument(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.document.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/documentos')
}
