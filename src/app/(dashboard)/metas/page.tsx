import { getGoals } from '@/actions/goals'
import { GoalsClient } from '@/components/goals/GoalsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function GoalsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  let goals: any[] = []
  let wallets: any[] = []
  try {
    const [goalsData, walletsData] = await Promise.all([
      getGoals(),
      prisma.wallet.findMany({ where: { userId: session.user.id } })
    ])
    goals = goalsData
    wallets = walletsData
  } catch {}

  return <GoalsClient goals={goals} wallets={wallets} />
}
