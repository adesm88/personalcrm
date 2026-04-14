"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reminderSchema, type ReminderFormData, REMINDER_PRIORITY_LABELS, REMINDER_STATUS_LABELS } from "@/lib/schemas"
import { createReminder, updateReminder } from "@/actions/reminders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ReminderFormProps {
  initialData?: ReminderFormData & { id?: string }
  dealId?: string
  contactId?: string
  companyId?: string
  deals?: { id: string; name: string }[]
  contacts?: { id: string; firstName: string; lastName: string }[]
  companies?: { id: string; name: string }[]
  onSuccess?: () => void
}

export function ReminderForm({
  initialData,
  dealId,
  contactId,
  companyId,
  deals = [],
  contacts = [],
  companies = [],
  onSuccess,
}: ReminderFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: initialData || {
      dealId: dealId || null,
      contactId: contactId || null,
      companyId: companyId || null,
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "MEDIUM",
      status: "PENDING",
    },
  })

  const onSubmit = async (data: ReminderFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateReminder(initialData.id, data)
        toast.success("Reminder updated")
      } else {
        await createReminder(data)
        toast.success("Reminder created")
      }
      reset()
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch {
      toast.error("Failed to save reminder")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rem-title">Title *</Label>
        <Input id="rem-title" {...register("title")} placeholder="e.g. Follow up with broker" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="rem-dueDate">Due Date *</Label>
          <Input id="rem-dueDate" type="datetime-local" {...register("dueDate")} />
          {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rem-priority">Priority</Label>
          <Select
            value={watch("priority")}
            onValueChange={(v) => setValue("priority", v as ReminderFormData["priority"])}
          >
            <SelectTrigger id="rem-priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(REMINDER_PRIORITY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rem-status">Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(v) => setValue("status", v as ReminderFormData["status"])}
          >
            <SelectTrigger id="rem-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(REMINDER_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entity links (only if not pre-set) */}
      {!dealId && !contactId && !companyId && (
        <div className="grid gap-4 sm:grid-cols-3">
          {deals.length > 0 && (
            <div className="space-y-2">
              <Label>Deal</Label>
              <Select
                value={watch("dealId") || "none"}
                onValueChange={(v) => setValue("dealId", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Link to deal..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {deals.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select
                value={watch("contactId") || "none"}
                onValueChange={(v) => setValue("contactId", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Link to contact..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={watch("companyId") || "none"}
                onValueChange={(v) => setValue("companyId", v === "none" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="Link to company..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="rem-description">Description</Label>
        <Textarea id="rem-description" {...register("description")} rows={3} placeholder="Details..." />
      </div>

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Update Reminder" : "Create Reminder"}
      </Button>
    </form>
  )
}
