import { getBills } from '@/actions/bills'
import { BillsClient } from '@/components/bills/BillsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function BillsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
  // Removida restrição para modo produção inicial

  let bills: any[] = []
  try {
    bills = await getBills()
  } catch {}

  return <BillsClient bills={bills} />
}
