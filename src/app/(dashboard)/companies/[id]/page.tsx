import Link from "next/link"
import { notFound } from "next/navigation"
import { getCompany, deleteCompany } from "@/actions/companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { COMPANY_STATUS_LABELS, CONTACT_ROLE_LABELS, DEAL_STAGE_LABELS } from "@/lib/schemas"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ReminderList } from "@/components/reminder-list"
import { ActivityForm } from "@/components/activity-form"
import { ReminderForm } from "@/components/reminder-form"
import { DeleteButton } from "@/components/delete-button"
import { ArrowLeft, Edit, ExternalLink, Users, Handshake, Plus, Building2, Activity, Bell } from "lucide-react"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) notFound()

  return (
    <div className="space-y-8">
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
            {company.parent && (
              <Link href={`/companies/${company.parent.id}`} className="text-primary hover:underline flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {company.parent.name}
              </Link>
            )}
            {company.industry && <span>{company.parent ? "•" : ""} {company.industry}</span>}
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

      {/* ── Info ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Info</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                <StatusBadge status={company.status} label={COMPANY_STATUS_LABELS[company.status]} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Parent Company</p>
                {company.parent ? (
                  <Link href={`/companies/${company.parent.id}`} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {company.parent.name}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Industry</p>
                <p className="text-sm">{company.industry || <span className="text-muted-foreground">—</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                <p className="text-sm">{company.location || <span className="text-muted-foreground">—</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    {company.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                <p className="text-sm">{company.revenue || <span className="text-muted-foreground">—</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Employees</p>
                <p className="text-sm">{company.employeeCount || <span className="text-muted-foreground">—</span>}</p>
              </div>
            </div>
            {company.description && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{company.description}</p>
              </div>
            )}
            {company.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Subsidiaries ── */}
      {company.children.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Subsidiaries ({company.children.length})
          </h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Contacts</TableHead>
                    <TableHead className="text-center">Deals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.children.map((child) => (
                    <TableRow key={child.id}>
                      <TableCell>
                        <Link href={`/companies/${child.id}`} className="font-medium text-primary hover:underline">
                          {child.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={child.status} label={COMPANY_STATUS_LABELS[child.status]} />
                      </TableCell>
                      <TableCell className="text-center">{child._count.contacts}</TableCell>
                      <TableCell className="text-center">{child._count.deals}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Contacts ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4" /> Contacts ({company.contacts.length})
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/contacts/new?companyId=${id}`}>
              <Plus className="mr-2 h-3 w-3" /> Add Contact
            </Link>
          </Button>
        </div>
        <Card>
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
      </section>

      {/* ── Deals ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Handshake className="h-4 w-4" /> Deals ({company.deals.length})
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/deals/new?companyId=${id}`}>
              <Plus className="mr-2 h-3 w-3" /> Add Deal
            </Link>
          </Button>
        </div>
        <Card>
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
      </section>

      {/* ── Activities ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activities ({company.activities.length})
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Activity</CardTitle></CardHeader>
            <CardContent>
              <ActivityForm companyId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <EntityActivityTimeline activities={company.activities} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Reminders ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Reminders ({company.reminders.length})
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Reminder</CardTitle></CardHeader>
            <CardContent>
              <ReminderForm companyId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ReminderList reminders={company.reminders} showLinkedEntity={false} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
