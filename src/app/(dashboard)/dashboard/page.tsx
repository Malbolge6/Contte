import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardData } from '@/actions/transactions'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
  
  let data
  try {
    data = await getDashboardData()
  } catch {
    data = null
  }

  return <DashboardClient data={data} userName={session?.user?.name || 'Usuário'} isPremium={user?.plan === 'PREMIUM'} />
}
