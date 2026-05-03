import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getTimelineEvents } from '@/actions/timeline'
import { TimelineClient } from './TimelineClient'

export default async function TimelinePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const events = await getTimelineEvents(50) // Fetch first 50 events

  return <TimelineClient initialEvents={events} />
}
