import { GroupsClient } from './GroupsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  return <GroupsClient />
}
