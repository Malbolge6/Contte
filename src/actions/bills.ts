'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getBills(status?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const where: any = { userId: session.user.id }
  if (status) where.status = status

  return prisma.bill.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: { documents: true },
  })
}

export async function getAlerts() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const now = new Date()
  const threeDaysLater = new Date()
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)

  const [upcoming, overdue] = await Promise.all([
    prisma.bill.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        dueDate: { gte: now, lte: threeDaysLater },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.bill.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
    }),
  ])

  return { upcoming, overdue }
}

export async function createBill(data: {
  name: string
  amount: number
  dueDate: Date
  description?: string
  pixKey?: string
  barcode?: string
  category?: string
  recurrent?: boolean
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.bill.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
}

export async function updateBill(id: string, data: Partial<{
  name: string
  amount: number
  dueDate: Date
  description: string
  pixKey: string
  barcode: string
  category: string
  recurrent: boolean
  status: string
}>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.bill.updateMany({
    where: { id, userId: session.user.id },
    data,
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
}

export async function markBillAsPaid(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const bill = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!bill) throw new Error('Conta não encontrada')

  await prisma.bill.update({
    where: { id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
    },
  })

  // Auto-create a transaction for this payment
  await prisma.transaction.create({
    data: {
      amount: bill.amount,
      type: 'EXPENSE',
      category: bill.category || 'outros',
      description: `Pagamento: ${bill.name}`,
      date: new Date(),
      paymentMethod: bill.pixKey ? 'pix' : bill.barcode ? 'boleto' : undefined,
      userId: session.user.id,
      billId: id,
    },
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
}

export async function deleteBill(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  await prisma.bill.deleteMany({
    where: { id, userId: session.user.id },
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
}
