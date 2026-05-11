'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTimelineEvent } from './timeline'

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

  const bill = await prisma.bill.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  })

  await createTimelineEvent({
    type: 'alert',
    title: 'Nova conta agendada 📅',
    description: `Você cadastrou a conta "${data.name}" no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.amount)} para o dia ${new Date(data.dueDate).toLocaleDateString('pt-BR')}.`,
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
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
  revalidatePath('/timeline')
}

export async function markBillAsPaid(id: string, walletId?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const bill = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!bill) throw new Error('Conta não encontrada')

  await prisma.$transaction(async (tx) => {
    // 1. Mark bill as paid
    await tx.bill.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    })

    // 2. Create Transaction (linked to bill, walletId NOT in schema — handled separately)
    await tx.transaction.create({
      data: {
        amount: bill.amount,
        type: 'EXPENSE',
        category: bill.category || 'outros',
        description: `Pagamento: ${bill.name}`,
        date: new Date(),
        paymentMethod: walletId ? 'carteira' : (bill.pixKey ? 'pix' : bill.barcode ? 'boleto' : undefined),
        userId: session.user.id,
        billId: id,
      },
    })

    // 3. Update Wallet Balance if walletId provided
    if (walletId) {
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { decrement: bill.amount }
        }
      })
    }

    // 4. Handle Recurrence
    if (bill.recurrent) {
      const nextDate = new Date(bill.dueDate)
      nextDate.setMonth(nextDate.getMonth() + 1)
      
      await tx.bill.create({
        data: {
          name: bill.name,
          amount: bill.amount,
          dueDate: nextDate,
          description: bill.description,
          pixKey: bill.pixKey,
          barcode: bill.barcode,
          category: bill.category,
          recurrent: true,
          userId: session.user.id,
          status: 'PENDING'
        }
      })
    }
  })

  await createTimelineEvent({
    type: 'expense',
    title: 'Conta Paga! ✅',
    description: `A conta "${bill.name}" foi marcada como paga. Menos uma preocupação!`,
    amount: bill.amount,
    category: bill.category,
  })

  revalidatePath('/contas')
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
  revalidatePath('/carteiras')
}

export async function unmarkBillAsPaid(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autenticado')

  const bill = await prisma.bill.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!bill) throw new Error('Conta não encontrada')

  await prisma.$transaction([
    prisma.bill.update({
      where: { id },
      data: {
        status: 'PENDING',
        paidAt: null,
      },
    }),
    prisma.transaction.deleteMany({
      where: { billId: id, userId: session.user.id }
    })
  ])

  revalidatePath('/contas')
  revalidatePath('/dashboard')
  revalidatePath('/timeline')
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
