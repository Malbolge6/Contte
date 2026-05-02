import { getBillGroups } from '@/actions/groups'
import { GroupsClient } from './GroupsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } })
  if (user?.plan !== 'PREMIUM') redirect('/premium')

  const groups = await getBillGroups()
  return <GroupsClient groups={groups} />
}
