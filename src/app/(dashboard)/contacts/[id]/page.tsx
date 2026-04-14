import Link from "next/link"
import { notFound } from "next/navigation"
import { getContact, deleteContact } from "@/actions/contacts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { CONTACT_ROLE_LABELS, DEAL_STAGE_LABELS } from "@/lib/schemas"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ReminderList } from "@/components/reminder-list"
import { ActivityForm } from "@/components/activity-form"
import { ReminderForm } from "@/components/reminder-form"
import { DeleteButton } from "@/components/delete-button"
import { ArrowLeft, Edit, Mail, Phone, Linkedin, ExternalLink, Handshake, Activity, Bell } from "lucide-react"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contact = await getContact(id)
  if (!contact) notFound()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contacts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            <StatusBadge status={contact.role} label={CONTACT_ROLE_LABELS[contact.role]} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            {contact.title && <span>{contact.title}</span>}
            {contact.company && (
              <>
                {contact.title && <span>•</span>}
                <Link href={`/companies/${contact.company.id}`} className="text-primary hover:underline">
                  {contact.company.name}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contacts/${id}/edit`}><Edit className="mr-2 h-3.5 w-3.5" /> Edit</Link>
          </Button>
          <DeleteButton id={id} action={deleteContact} redirectTo="/contacts" label="Delete" />
        </div>
      </div>

      {/* ── Info ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Info</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company</p>
                {contact.company ? (
                  <Link href={`/companies/${contact.company.id}`} className="text-sm text-primary hover:underline font-medium">
                    {contact.company.name}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                <p className="text-sm"><StatusBadge status={contact.role} label={CONTACT_ROLE_LABELS[contact.role]} /></p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {contact.email}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {contact.phone}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Job Title</p>
                <p className="text-sm">{contact.title || <span className="text-muted-foreground">—</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">LinkedIn</p>
                {contact.linkedIn ? (
                  <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Linkedin className="h-3.5 w-3.5" /> Profile <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
            {contact.notes && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Deals ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Handshake className="h-4 w-4" /> Deals ({contact.deals.length})
        </h2>
        <Card>
          <CardContent className="p-0">
            {contact.deals.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Not linked to any deals</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contact.deals.map((dc) => (
                    <TableRow key={dc.deal.id}>
                      <TableCell>
                        <Link href={`/deals/${dc.deal.id}`} className="font-medium text-primary hover:underline">
                          {dc.deal.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={dc.deal.stage} label={DEAL_STAGE_LABELS[dc.deal.stage]} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Activities ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activities ({contact.activities.length})
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityForm contactId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <EntityActivityTimeline activities={contact.activities} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Reminders ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Reminders ({contact.reminders.length})
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Reminder</CardTitle></CardHeader>
            <CardContent>
              <ReminderForm contactId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ReminderList reminders={contact.reminders} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
