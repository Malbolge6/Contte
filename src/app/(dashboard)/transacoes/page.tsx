import { getTransactions } from '@/actions/transactions'
import { TransactionsClient } from '@/components/transactions/TransactionsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
  if (user?.plan !== 'PREMIUM') redirect('/premium')

  let transactions: any[] = []
  try {
    transactions = await getTransactions()
  } catch {}

  return <TransactionsClient transactions={transactions} />
}
