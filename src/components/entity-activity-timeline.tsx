"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate, formatDateTime } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import { ACTIVITY_TYPE_LABELS, ACTIVITY_PRIORITY_LABELS, ACTIVITY_STATUS_LABELS } from "@/lib/schemas"
import { updateActivity, deleteActivity } from "@/actions/activities"
import { ActivityForm } from "@/components/activity-form"
import type { ActivityFormData } from "@/lib/schemas"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  FileText,
  Phone,
  Mail,
  Users,
  MapPin,
  Bell,
  MoreHorizontal,
  AlertTriangle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"

const activityIcons: Record<string, React.ElementType> = {
  NOTE: FileText,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  SITE_VISIT: MapPin,
  REMINDER: Bell,
  OTHER: MoreHorizontal,
}

interface ActivityItem {
  id: string
  type: string
  subject: string
  description?: string | null
  date: Date | string
  dueDate?: Date | string | null
  priority?: string | null
  status?: string | null
  dealId?: string | null
  contactId?: string | null
  companyId?: string | null
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
  const router = useRouter()
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isOverdue = (dueDate: Date | string | null | undefined) => {
    if (!dueDate) return false
    const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate
    return d < new Date()
  }

  const formatForInput = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return
    setDeletingId(id)
    try {
      await deleteActivity(id)
      toast.success("Activity deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete activity")
    } finally {
      setDeletingId(null)
    }
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <FileText className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No activities yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-1">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || MoreHorizontal
          const isReminderType = activity.type === "REMINDER"
          const overdue =
            isReminderType &&
            isOverdue(activity.dueDate) &&
            activity.status !== "COMPLETED" &&
            activity.status !== "CANCELLED"

          return (
            <div
              key={activity.id}
              className={`flex gap-3 py-3 group ${isReminderType && overdue ? "bg-red-50/50 -mx-2 px-2 rounded-lg" : ""}`}
            >
              {/* Timeline line + icon */}
              <div className="flex flex-col items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isReminderType
                    ? activity.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-600"
                      : activity.status === "CANCELLED"
                      ? "bg-gray-100 text-gray-400"
                      : overdue
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-600"
                    : "bg-muted group-hover:bg-primary/10"
                }`}>
                  <Icon className={`h-3.5 w-3.5 ${
                    isReminderType ? "" : "text-muted-foreground group-hover:text-primary transition-colors"
                  }`} />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-medium truncate ${
                    isReminderType && activity.status === "COMPLETED"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}>{activity.subject}</p>
                  <StatusBadge
                    status={activity.type}
                    label={ACTIVITY_TYPE_LABELS[activity.type]}
                  />
                  {isReminderType && activity.priority && (
                    <StatusBadge
                      status={activity.priority}
                      label={ACTIVITY_PRIORITY_LABELS[activity.priority]}
                    />
                  )}
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {isReminderType && activity.dueDate ? (
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {overdue && <AlertTriangle className="h-3 w-3" />}
                      Due: {formatDateTime(activity.dueDate)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </span>
                  )}
                  {isReminderType && activity.status && (
                    <StatusBadge
                      status={activity.status}
                      label={ACTIVITY_STATUS_LABELS[activity.status]}
                    />
                  )}
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

                  {/* Edit / Delete actions */}
                  <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setEditingActivity(activity)}
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(activity.id)}
                      disabled={deletingId === activity.id}
                      title="Delete"
                    >
                      {deletingId === activity.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Dialog */}
      {editingActivity && (
        <ActivityEditDialog
          activity={editingActivity}
          open={!!editingActivity}
          onOpenChange={(open) => {
            if (!open) setEditingActivity(null)
          }}
        />
      )}
    </>
  )
}

// --- Inline Edit Dialog ---
function ActivityEditDialog({
  activity,
  open,
  onOpenChange,
}: {
  activity: ActivityItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const formatForInput = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const initialData: ActivityFormData & { id: string } = {
    id: activity.id,
    dealId: activity.dealId || activity.deal?.id || null,
    contactId: activity.contactId || activity.contact?.id || null,
    companyId: activity.companyId || activity.company?.id || null,
    type: activity.type as ActivityFormData["type"],
    subject: activity.subject,
    description: activity.description || "",
    date: formatForInput(activity.date) as unknown as Date,
    dueDate: activity.dueDate ? (formatForInput(activity.dueDate) as unknown as Date) : null,
    priority: (activity.priority as ActivityFormData["priority"]) || "MEDIUM",
    status: (activity.status as ActivityFormData["status"]) || "PENDING",
  }

  const linkedTo = [
    activity.deal && `Deal: ${activity.deal.name}`,
    activity.contact &&
      `Contact: ${activity.contact.firstName} ${activity.contact.lastName}`,
    activity.company && `Company: ${activity.company.name}`,
  ].filter(Boolean)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this activity?")) return
    setIsDeleting(true)
    try {
      await deleteActivity(activity.id)
      toast.success("Activity deleted")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Failed to delete activity")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {activity.type === "REMINDER" ? "Reminder" : "Activity"}</DialogTitle>
          {linkedTo.length > 0 && (
            <DialogDescription>{linkedTo.join(" • ")}</DialogDescription>
          )}
        </DialogHeader>

        <ActivityForm
          initialData={initialData}
          onSuccess={() => {
            onOpenChange(false)
            router.refresh()
          }}
        />

        <div className="flex justify-start pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
