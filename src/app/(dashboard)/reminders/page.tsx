import { getReminders } from "@/actions/reminders"
import { getDeals } from "@/actions/deals"
import { getContacts } from "@/actions/contacts"
import { getCompanies } from "@/actions/companies"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReminderList } from "@/components/reminder-list"
import { ReminderForm } from "@/components/reminder-form"
import { Bell } from "lucide-react"

export default async function RemindersPage() {
  let reminders: Awaited<ReturnType<typeof getReminders>> = []
  let deals: { id: string; name: string }[] = []
  let contacts: { id: string; firstName: string; lastName: string }[] = []
  let companies: { id: string; name: string }[] = []

  try {
    const [allReminders, allDeals, allContacts, allCompanies] = await Promise.all([
      getReminders(true),
      getDeals(),
      getContacts(),
      getCompanies(),
    ])
    reminders = allReminders
    deals = allDeals.map((d) => ({ id: d.id, name: d.name }))
    contacts = allContacts.map((c) => ({ id: c.id, firstName: c.firstName, lastName: c.lastName }))
    companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
  } catch {}

  const activeReminders = reminders.filter((r) => r.status === "PENDING" || r.status === "IN_PROGRESS")
  const completedReminders = reminders.filter((r) => r.status === "COMPLETED" || r.status === "CANCELLED")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reminders & Next Steps</h1>
        <p className="text-muted-foreground">{activeReminders.length} active, {completedReminders.length} completed</p>
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Add Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderForm deals={deals} contacts={contacts} companies={companies} />
        </CardContent>
      </Card>

      {/* Active */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4" /> Active ({activeReminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReminderList reminders={activeReminders} />
        </CardContent>
      </Card>

      {/* Completed */}
      {completedReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completed / Cancelled ({completedReminders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ReminderList reminders={completedReminders} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
