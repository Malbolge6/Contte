import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTimelineEvents, backfillTimeline } from '@/actions/timeline'
import { TimelineClient } from './TimelineClient'
import { prisma } from '@/lib/prisma'

export default async function TimelinePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hourlyRate: true }
  })

  // Run backfill once if feed is empty (don't crash the page if it fails)
  try {
    await backfillTimeline()
  } catch (err) {
    console.error('Failed to backfill timeline:', err)
  }
  
  let events = []
  try {
    events = await getTimelineEvents(50) 
  } catch (err) {
    console.error('Failed to fetch timeline events:', err)
  }

  return <TimelineClient initialEvents={events as any} hourlyRate={user?.hourlyRate || 0} />
}
