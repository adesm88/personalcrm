"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  reminderSchema,
  type ReminderFormData,
  REMINDER_PRIORITY_LABELS,
  REMINDER_STATUS_LABELS,
} from "@/lib/schemas"
import { updateReminder, deleteReminder } from "@/actions/reminders"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"

interface ReminderEditDialogProps {
  reminder: {
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
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReminderEditDialog({
  reminder,
  open,
  onOpenChange,
}: ReminderEditDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // Format dueDate for datetime-local input
  const formatForInput = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: {
      dealId: reminder.dealId || reminder.deal?.id || null,
      contactId: reminder.contactId || reminder.contact?.id || null,
      companyId: reminder.companyId || reminder.company?.id || null,
      title: reminder.title,
      description: reminder.description || "",
      // datetime-local inputs require a string in YYYY-MM-DDTHH:MM format;
      // z.coerce.date() in the schema will convert it back on submit
      dueDate: formatForInput(reminder.dueDate) as unknown as Date,
      priority: reminder.priority as ReminderFormData["priority"],
      status: reminder.status as ReminderFormData["status"],
    },
  })

  const onSubmit = async (data: ReminderFormData) => {
    try {
      await updateReminder(reminder.id, data)
      toast.success("Reminder updated")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Failed to update reminder")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reminder?")) return
    setIsDeleting(true)
    try {
      await deleteReminder(reminder.id)
      toast.success("Reminder deleted")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Failed to delete reminder")
    } finally {
      setIsDeleting(false)
    }
  }

  const linkedTo = [
    reminder.deal && `Deal: ${reminder.deal.name}`,
    reminder.contact &&
      `Contact: ${reminder.contact.firstName} ${reminder.contact.lastName}`,
    reminder.company && `Company: ${reminder.company.name}`,
  ].filter(Boolean)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
          {linkedTo.length > 0 && (
            <DialogDescription>{linkedTo.join(" • ")}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-rem-title">Title *</Label>
            <Input
              id="edit-rem-title"
              {...register("title")}
              placeholder="e.g. Follow up with broker"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-rem-dueDate">Due Date *</Label>
              <Input
                id="edit-rem-dueDate"
                type="datetime-local"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rem-priority">Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) =>
                  setValue("priority", v as ReminderFormData["priority"])
                }
              >
                <SelectTrigger id="edit-rem-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REMINDER_PRIORITY_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rem-status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as ReminderFormData["status"])
                }
              >
                <SelectTrigger id="edit-rem-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REMINDER_STATUS_LABELS).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-rem-description">Description</Label>
            <Textarea
              id="edit-rem-description"
              {...register("description")}
              rows={3}
              placeholder="Details..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} size="sm">
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
