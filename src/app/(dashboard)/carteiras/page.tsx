import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getWallets } from '@/actions/wallets'
import { WalletsClient } from './WalletsClient'

export default async function CarteirasPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const wallets = await getWallets()

  return <WalletsClient wallets={wallets} />
}
