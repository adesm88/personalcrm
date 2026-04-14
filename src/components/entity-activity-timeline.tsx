"use client"

import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import { ACTIVITY_TYPE_LABELS } from "@/lib/schemas"
import {
  FileText,
  Phone,
  Mail,
  Users,
  MapPin,
  MoreHorizontal,
} from "lucide-react"

const activityIcons: Record<string, React.ElementType> = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  SITE_VISIT: MapPin,
  OTHER: MoreHorizontal,
}

interface ActivityItem {
  id: string
  type: string
  subject: string
  description?: string | null
  date: Date | string
  deal?: { id: string; name: string } | null
  contact?: { id: string; firstName: string; lastName: string } | null
  company?: { id: string; name: string } | null
}

interface EntityActivityTimelineProps {
  activities: ActivityItem[]
  showLinkedEntity?: boolean
}

export function EntityActivityTimeline({
  activities,
  showLinkedEntity = true,
}: EntityActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <FileText className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No activities yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || MoreHorizontal
        return (
          <div
            key={activity.id}
            className="flex gap-3 py-3 group"
          >
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              {index < activities.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium truncate">{activity.subject}</p>
                <StatusBadge
                  status={activity.type}
                  label={ACTIVITY_TYPE_LABELS[activity.type]}
                />
              </div>
              {activity.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                  {activity.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {formatDate(activity.date)}
                </span>
                {showLinkedEntity && (
                  <div className="flex items-center gap-2">
                    {activity.deal && (
                      <Link
                        href={`/deals/${activity.deal.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {activity.deal.name}
                      </Link>
                    )}
                    {activity.contact && (
                      <Link
                        href={`/contacts/${activity.contact.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {activity.contact.firstName} {activity.contact.lastName}
                      </Link>
                    )}
                    {activity.company && (
                      <Link
                        href={`/companies/${activity.company.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {activity.company.name}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
