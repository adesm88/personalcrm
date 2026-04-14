import Link from "next/link"
import { getDealsByStage, getDeals } from "@/actions/deals"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS } from "@/lib/schemas"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PipelineBoard } from "@/components/pipeline-board"
import { Plus, Handshake, ExternalLink } from "lucide-react"

export default async function DealsPage() {
  let dealsByStage: Awaited<ReturnType<typeof getDealsByStage>> = {}
  let deals: Awaited<ReturnType<typeof getDeals>> = []
  try {
    [dealsByStage, deals] = await Promise.all([getDealsByStage(), getDeals()])
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">{deals.length} deals in progress</p>
        </div>
        <Button asChild>
          <Link href="/deals/new"><Plus className="mr-2 h-4 w-4" /> New Deal</Link>
        </Button>
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          {deals.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Handshake className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No deals yet</p>
                  <p className="text-xs mt-1">Create your first deal to start the pipeline</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/deals/new"><Plus className="mr-2 h-3 w-3" /> New Deal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <PipelineBoard dealsByStage={dealsByStage} />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {deals.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">No deals</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Asking Price</TableHead>
                      <TableHead>Expected Close</TableHead>
                      <TableHead>Contacts</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id} className="group">
                        <TableCell>
                          <Link href={`/deals/${deal.id}`} className="font-medium text-primary hover:underline">
                            {deal.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {deal.company ? (
                            <Link href={`/companies/${deal.company.id}`} className="text-muted-foreground hover:underline">
                              {deal.company.name}
                            </Link>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={deal.stage} label={DEAL_STAGE_LABELS[deal.stage]} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={deal.priority} label={DEAL_PRIORITY_LABELS[deal.priority]} />
                        </TableCell>
                        <TableCell className="text-sm">{formatCurrency(deal.askingPrice)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(deal.expectedCloseDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {deal.contacts.length > 0
                            ? deal.contacts.map((dc) => `${dc.contact.firstName} ${dc.contact.lastName}`).join(", ")
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" asChild>
                            <Link href={`/deals/${deal.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
