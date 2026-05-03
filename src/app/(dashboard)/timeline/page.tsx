import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTimelineEvents, backfillTimeline } from '@/actions/timeline'
import { TimelineClient } from './TimelineClient'

export default async function TimelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Run backfill once if feed is empty
  await backfillTimeline()
  
  const events = await getTimelineEvents(50) 

  return <TimelineClient initialEvents={events} />
}
