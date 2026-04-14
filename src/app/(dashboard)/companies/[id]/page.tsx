import Link from "next/link"
import { notFound } from "next/navigation"
import { getCompany, deleteCompany } from "@/actions/companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { COMPANY_STATUS_LABELS, CONTACT_ROLE_LABELS, DEAL_STAGE_LABELS } from "@/lib/schemas"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ReminderList } from "@/components/reminder-list"
import { ActivityForm } from "@/components/activity-form"
import { ReminderForm } from "@/components/reminder-form"
import { DeleteButton } from "@/components/delete-button"
import { ArrowLeft, Edit, ExternalLink, Users, Handshake, Plus } from "lucide-react"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/companies"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
            <StatusBadge status={company.status} label={COMPANY_STATUS_LABELS[company.status]} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            {company.parentCompany && (
              <Link href={`/parent-companies/${company.parentCompany.id}`} className="text-primary hover:underline">
                {company.parentCompany.name}
              </Link>
            )}
            {company.industry && <span>{company.industry}</span>}
            {company.location && <span>• {company.location}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/companies/${id}/edit`}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          <DeleteButton id={id} action={deleteCompany} redirectTo="/companies" label="Delete" />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {company.website && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Website</p>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                {company.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        )}
        {company.revenue && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Revenue</p>
              <p className="text-sm font-medium">{company.revenue}</p>
            </CardContent>
          </Card>
        )}
        {company.employeeCount && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Employees</p>
              <p className="text-sm font-medium">{company.employeeCount}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {company.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Contacts ({company.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5">
            <Handshake className="h-3.5 w-3.5" /> Deals ({company.deals.length})
          </TabsTrigger>
          <TabsTrigger value="activities">Activities ({company.activities.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminders ({company.reminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Contacts</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/contacts/new?companyId=${id}`}>
                  <Plus className="mr-2 h-3 w-3" /> Add Contact
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {company.contacts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No contacts</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link href={`/contacts/${contact.id}`} className="font-medium text-primary hover:underline">
                            {contact.firstName} {contact.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{contact.title || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={contact.role} label={CONTACT_ROLE_LABELS[contact.role]} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{contact.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{contact.phone || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Deals</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/deals/new?companyId=${id}`}>
                  <Plus className="mr-2 h-3 w-3" /> Add Deal
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {company.deals.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No deals</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <Link href={`/deals/${deal.id}`} className="font-medium text-primary hover:underline">
                            {deal.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={deal.stage} label={DEAL_STAGE_LABELS[deal.stage]} />
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
            <CardHeader>
              <CardTitle className="text-sm">Log Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityForm companyId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityActivityTimeline activities={company.activities} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <ReminderForm companyId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <ReminderList reminders={company.reminders} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {company.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
