import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'
import { LockScreenWrapper } from '@/components/layout/LockScreenWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <LockScreenWrapper>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            paddingBottom: '88px',
          }}
        >
          <TopBar user={session.user} />
          <main style={{ padding: '0 16px 16px' }}>
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </LockScreenWrapper>
  )
}
