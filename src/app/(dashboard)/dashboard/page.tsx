import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDashboardData } from '@/actions/transactions'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

import { checkAndGenerateDailyUpdate } from '@/actions/daily'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Trigger daily summary on timeline if it's a new day
  await checkAndGenerateDailyUpdate()

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
  
  let data
  try {
    data = await getDashboardData()
  } catch {
    data = null
  }

  return <DashboardClient data={data} userName={session?.user?.name || 'Usuário'} userEmail={session?.user?.email || ''} isPremium={user?.plan === 'PREMIUM'} />
}
