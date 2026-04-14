import Link from "next/link"
import { notFound } from "next/navigation"
import { getDeal, deleteDeal } from "@/actions/deals"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS, CONTACT_ROLE_LABELS } from "@/lib/schemas"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ReminderList } from "@/components/reminder-list"
import { ActivityForm } from "@/components/activity-form"
import { ReminderForm } from "@/components/reminder-form"
import { DeleteButton } from "@/components/delete-button"
import { ArrowLeft, Edit, Building2, Users, DollarSign, Calendar, Target } from "lucide-react"

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDeal(id)
  if (!deal) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/deals"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{deal.name}</h1>
            <StatusBadge status={deal.stage} label={DEAL_STAGE_LABELS[deal.stage]} />
            <StatusBadge status={deal.priority} label={DEAL_PRIORITY_LABELS[deal.priority]} />
          </div>
          {deal.company && (
            <Link
              href={`/companies/${deal.company.id}`}
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5"
            >
              <Building2 className="h-3.5 w-3.5" /> {deal.company.name}
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/deals/${id}/edit`}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</Link>
          </Button>
          <DeleteButton id={id} action={deleteDeal} redirectTo="/deals" label="Delete" />
        </div>
      </div>

      {/* Deal Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Asking Price</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(deal.askingPrice, deal.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(deal.revenue, deal.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">EBITDA</p>
            </div>
            <p className="text-lg font-semibold">{formatCurrency(deal.ebitda, deal.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Expected Close</p>
            </div>
            <p className="text-lg font-semibold">{formatDate(deal.expectedCloseDate)}</p>
          </CardContent>
        </Card>
      </div>

      {deal.source && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-0.5">Source</p>
            <p className="text-sm">{deal.source}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Contacts ({deal.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="activities">Activities ({deal.activities.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminders ({deal.reminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {deal.contacts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No contacts linked to this deal</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deal.contacts.map((dc) => (
                      <TableRow key={dc.contact.id}>
                        <TableCell>
                          <Link href={`/contacts/${dc.contact.id}`} className="font-medium text-primary hover:underline">
                            {dc.contact.firstName} {dc.contact.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={dc.contact.role} label={CONTACT_ROLE_LABELS[dc.contact.role]} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dc.contact.email || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{dc.contact.phone || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityForm dealId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <EntityActivityTimeline activities={deal.activities} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Reminder / Next Step</CardTitle></CardHeader>
            <CardContent>
              <ReminderForm dealId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ReminderList reminders={deal.reminders} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {deal.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
