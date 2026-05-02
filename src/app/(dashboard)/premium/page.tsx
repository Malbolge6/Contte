import { PremiumClient } from '@/components/premium/PremiumClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function PremiumPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true }
  })

  return <PremiumClient isPremium={user?.plan === 'PREMIUM'} />
}
