"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import { REMINDER_PRIORITY_LABELS, REMINDER_STATUS_LABELS } from "@/lib/schemas"
import { ReminderEditDialog } from "@/components/reminder-edit-dialog"
import { Clock, AlertTriangle, Pencil } from "lucide-react"

interface ReminderItem {
  id: string
  title: string
  description?: string | null
  dueDate: Date | string
  priority: string
  status: string
  dealId?: string | null
  contactId?: string | null
  companyId?: string | null
  deal?: { id: string; name: string } | null
  contact?: { id: string; firstName: string; lastName: string } | null
  company?: { id: string; name: string } | null
}

interface ReminderListProps {
  reminders: ReminderItem[]
  showLinkedEntity?: boolean
}

export function ReminderList({ reminders, showLinkedEntity = true }: ReminderListProps) {
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null)

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Clock className="h-10 w-10 mb-2 opacity-40" />
        <p className="text-sm">No reminders</p>
      </div>
    )
  }

  const isOverdue = (dueDate: Date | string) => {
    const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate
    return d < new Date()
  }

  return (
    <>
      <div className="space-y-2">
        {reminders.map((reminder) => {
          const overdue =
            isOverdue(reminder.dueDate) &&
            reminder.status !== "COMPLETED" &&
            reminder.status !== "CANCELLED"

          return (
            <div
              key={reminder.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm cursor-pointer group ${
                overdue ? "border-red-200 bg-red-50/50" : "bg-card hover:border-primary/20"
              }`}
              onClick={() => setEditingReminder(reminder)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setEditingReminder(reminder)
                }
              }}
            >
              {/* Edit indicator */}
              <div
                className={`h-6 w-6 shrink-0 mt-0.5 rounded-full flex items-center justify-center ${
                  reminder.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-600"
                    : reminder.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-600"
                    : reminder.status === "CANCELLED"
                    ? "bg-gray-100 text-gray-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className={`text-sm font-medium ${
                      reminder.status === "COMPLETED"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {reminder.title}
                  </p>
                  <StatusBadge
                    status={reminder.priority}
                    label={REMINDER_PRIORITY_LABELS[reminder.priority]}
                  />
                </div>
                {reminder.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {reminder.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`text-xs flex items-center gap-1 ${
                      overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {overdue && <AlertTriangle className="h-3 w-3" />}
                    {formatDateTime(reminder.dueDate)}
                  </span>
                  <StatusBadge
                    status={reminder.status}
                    label={REMINDER_STATUS_LABELS[reminder.status]}
                  />
                  {showLinkedEntity && (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {reminder.deal && (
                        <Link
                          href={`/deals/${reminder.deal.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {reminder.deal.name}
                        </Link>
                      )}
                      {reminder.contact && (
                        <Link
                          href={`/contacts/${reminder.contact.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {reminder.contact.firstName} {reminder.contact.lastName}
                        </Link>
                      )}
                      {reminder.company && (
                        <Link
                          href={`/companies/${reminder.company.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {reminder.company.name}
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

      {/* Edit Dialog */}
      {editingReminder && (
        <ReminderEditDialog
          reminder={editingReminder}
          open={!!editingReminder}
          onOpenChange={(open) => {
            if (!open) setEditingReminder(null)
          }}
        />
      )}
    </>
  )
}
