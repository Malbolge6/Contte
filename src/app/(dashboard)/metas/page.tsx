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
  try {
    goals = await getGoals()
  } catch {}

  return <GoalsClient goals={goals} />
}
