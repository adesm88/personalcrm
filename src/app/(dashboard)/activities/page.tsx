import { getActivities } from "@/actions/activities"
import { getDeals } from "@/actions/deals"
import { getContacts } from "@/actions/contacts"
import { getCompanies } from "@/actions/companies"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ActivityForm } from "@/components/activity-form"
import { Activity } from "lucide-react"

export default async function ActivitiesPage() {
  let activities: Awaited<ReturnType<typeof getActivities>> = []
  let deals: { id: string; name: string }[] = []
  let contacts: { id: string; firstName: string; lastName: string }[] = []
  let companies: { id: string; name: string }[] = []

  try {
    const [allActivities, allDeals, allContacts, allCompanies] = await Promise.all([
      getActivities(100),
      getDeals(),
      getContacts(),
      getCompanies(),
    ])
    activities = allActivities
    deals = allDeals.map((d) => ({ id: d.id, name: d.name }))
    contacts = allContacts.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))
    companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">All notes, calls, meetings, and interactions</p>
      </div>

      {/* Log Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log New Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityForm deals={deals} contacts={contacts} companies={companies} />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" /> Timeline ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EntityActivityTimeline activities={activities} />
        </CardContent>
      </Card>
    </div>
  )
}
