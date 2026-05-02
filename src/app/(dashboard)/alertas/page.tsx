import { getAlerts } from '@/actions/bills'
import { AlertsClient } from '@/components/alerts/AlertsClient'

export default async function AlertsPage() {
  let alerts = { upcoming: [], overdue: [] }
  try {
    alerts = await getAlerts()
  } catch {}

  return <AlertsClient alerts={alerts} />
}
