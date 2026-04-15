import Link from "next/link"
import { notFound } from "next/navigation"
import { getDeal, deleteDeal } from "@/actions/deals"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS, CONTACT_ROLE_LABELS } from "@/lib/schemas"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { ActivityForm } from "@/components/activity-form"
import { DeleteButton } from "@/components/delete-button"
import { NoteForm } from "@/components/note-form"
import { NoteList } from "@/components/note-list"
import { ArrowLeft, Edit, Building2, Users, DollarSign, Calendar, Target, Activity, StickyNote } from "lucide-react"

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const deal = await getDeal(id)
  if (!deal) notFound()

  return (
    <div className="space-y-8">
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

      {/* ── Info ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Info</h2>
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Stage</p>
                <StatusBadge status={deal.stage} label={DEAL_STAGE_LABELS[deal.stage]} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                <StatusBadge status={deal.priority} label={DEAL_PRIORITY_LABELS[deal.priority]} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Company</p>
                {deal.company ? (
                  <Link href={`/companies/${deal.company.id}`} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {deal.company.name}
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Expected Close</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {formatDate(deal.expectedCloseDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Asking Price</p>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> {formatCurrency(deal.askingPrice, deal.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" /> {formatCurrency(deal.revenue, deal.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">EBITDA</p>
                <p className="text-sm font-semibold flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" /> {formatCurrency(deal.ebitda, deal.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Source</p>
                <p className="text-sm">{deal.source || <span className="text-muted-foreground">—</span>}</p>
              </div>
            </div>
            {deal.notes && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Contacts ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" /> Contacts ({deal.contacts.length})
        </h2>
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
      </section>

      {/* ── Activities ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Activities ({deal.activities.length})
        </h2>
        <div className="space-y-4">
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
        </div>
      </section>

      {/* ── Notes ── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <StickyNote className="h-4 w-4" /> Notes ({deal.entityNotes.length})
        </h2>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Note</CardTitle></CardHeader>
            <CardContent>
              <NoteForm dealId={id} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <NoteList notes={deal.entityNotes} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
