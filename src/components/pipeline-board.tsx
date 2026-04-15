"use client"

import Link from "next/link"
import { StatusBadge } from "@/components/status-badge"
import { DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS } from "@/lib/schemas"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PipelineDeal {
  id: string
  name: string
  stage: string
  priority: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  askingPrice?: any
  company?: { id: string; name: string } | null
  _count?: { activities: number }
}

interface PipelineBoardProps {
  dealsByStage: Record<string, PipelineDeal[]>
}

const stageOrder = [
  "LEAD",
  "INITIAL_CONTACT",
  "NDA_SIGNED",
  "DUE_DILIGENCE",
  "LOI",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]

export function PipelineBoard({ dealsByStage }: PipelineBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stageOrder.map((stage) => {
        const deals = dealsByStage[stage] || []
        return (
          <div
            key={stage}
            className="flex-shrink-0 w-72"
          >
            <Card className="h-full">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {DEAL_STAGE_LABELS[stage]}
                  </CardTitle>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                    {deals.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2 min-h-[200px]">
                {deals.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                    No deals
                  </div>
                ) : (
                  deals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block rounded-lg border bg-card p-3 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-medium truncate mb-1.5">
                        {deal.name}
                      </p>
                      {deal.company && (
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {deal.company.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <StatusBadge
                          status={deal.priority}
                          label={DEAL_PRIORITY_LABELS[deal.priority]}
                        />
                        {deal.askingPrice && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatCurrency(deal.askingPrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
