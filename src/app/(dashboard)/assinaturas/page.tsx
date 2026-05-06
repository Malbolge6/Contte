import { getSubscriptions } from '@/actions/subscriptions'
import { SubscriptionsClient } from '@/components/subscriptions/SubscriptionsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const subscriptions = await getSubscriptions()

  // Convert decimal to number for the client
  const serializedSubscriptions = subscriptions.map(s => ({
    ...s,
    amount: Number(s.amount)
  }))

  return <SubscriptionsClient initialSubscriptions={serializedSubscriptions} />
}
