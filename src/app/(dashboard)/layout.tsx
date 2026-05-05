import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { TopBar } from '@/components/layout/TopBar'
import { LockScreenWrapper } from '@/components/layout/LockScreenWrapper'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true }
  })

  const headerList = headers()
  const pathname = headerList.get('x-invoke-path') || ''
  
  // Se não for premium e não estiver nas páginas de liberação/pagamento, bloqueia.
  const isAdmin = session?.user?.email === 'brunosscontatos@gmail.com'
  const isPremium = user?.plan === 'PREMIUM' || isAdmin
  const isPublicDashboardPage = pathname.includes('/premium') || pathname.includes('/checkout') || pathname.includes('/sucesso') || pathname.includes('/_next')

  if (!isPremium && !isPublicDashboardPage && pathname !== '') {
    redirect('/premium')
  }

  return (
    <LockScreenWrapper>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Desktop sidebar layout */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            paddingBottom: '88px', // Bottom nav height
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
