import Link from "next/link"
import { notFound } from "next/navigation"
import { getContact, deleteContact } from "@/actions/contacts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { CONTACT_ROLE_LABELS, DEAL_STAGE_LABELS } from "@/lib/schemas"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ReminderList } from "@/components/reminder-list"
import { ActivityForm } from "@/components/activity-form"
import { ReminderForm } from "@/components/reminder-form"
import { DeleteButton } from "@/components/delete-button"
import { ArrowLeft, Edit, Mail, Phone, Linkedin, ExternalLink } from "lucide-react"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const contact = await getContact(id)
  if (!contact) notFound()

  return (
    <div className="space-y-6">
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

      {/* Contact Info */}
      <div className="flex flex-wrap gap-3">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline border rounded-lg px-3 py-1.5">
            <Mail className="h-3.5 w-3.5" /> {contact.email}
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline border rounded-lg px-3 py-1.5">
            <Phone className="h-3.5 w-3.5" /> {contact.phone}
          </a>
        )}
        {contact.linkedIn && (
          <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline border rounded-lg px-3 py-1.5">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Deals ({contact.deals.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({contact.activities.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminders ({contact.reminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="mt-4">
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
        </TabsContent>

        <TabsContent value="activities" className="mt-4 space-y-4">
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
        </TabsContent>

        <TabsContent value="reminders" className="mt-4 space-y-4">
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
        </TabsContent>
      </Tabs>

      {contact.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
