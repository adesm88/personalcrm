"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { activitySchema, type ActivityFormData, ACTIVITY_TYPE_LABELS, ACTIVITY_PRIORITY_LABELS, ACTIVITY_STATUS_LABELS } from "@/lib/schemas"
import { createActivity, updateActivity } from "@/actions/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ActivityFormProps {
  initialData?: ActivityFormData & { id?: string }
  dealId?: string
  contactId?: string
  companyId?: string
  deals?: { id: string; name: string }[]
  contacts?: { id: string; firstName: string; lastName: string }[]
  companies?: { id: string; name: string }[]
  onSuccess?: () => void
}

export function ActivityForm({
  initialData,
  dealId,
  contactId,
  companyId,
  deals = [],
  contacts = [],
  companies = [],
  onSuccess,
}: ActivityFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(activitySchema) as any,
    defaultValues: initialData || {
      dealId: dealId || null,
      contactId: contactId || null,
      companyId: companyId || null,
      type: "NOTE",
      subject: "",
      description: "",
      date: new Date(),
      dueDate: null,
      priority: "MEDIUM",
      status: "PENDING",
    },
  })

  const selectedType = watch("type")
  const isReminder = selectedType === "REMINDER"

  const onSubmit = async (data: ActivityFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateActivity(initialData.id, data)
        toast.success("Activity updated")
      } else {
        await createActivity(data)
        toast.success(isReminder ? "Reminder created" : "Activity logged")
      }
      reset()
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch {
      toast.error("Failed to save activity")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="act-type">Type</Label>
          <Select
            value={watch("type")}
            onValueChange={(v) => setValue("type", v as ActivityFormData["type"])}
          >
            <SelectTrigger id="act-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="act-date">{isReminder ? "Created Date" : "Date"}</Label>
          <Input id="act-date" type="datetime-local" {...register("date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="act-subject">Subject *</Label>
        <Input id="act-subject" {...register("subject")} placeholder={isReminder ? "e.g. Follow up with broker" : "Brief summary..."} />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      {/* Reminder-specific fields */}
      {isReminder && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="act-dueDate">Due Date *</Label>
            <Input id="act-dueDate" type="datetime-local" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-priority">Priority</Label>
            <Select
              value={watch("priority") || "MEDIUM"}
              onValueChange={(v) => setValue("priority", v as ActivityFormData["priority"])}
            >
              <SelectTrigger id="act-priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_PRIORITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="act-status">Status</Label>
            <Select
              value={watch("status") || "PENDING"}
              onValueChange={(v) => setValue("status", v as ActivityFormData["status"])}
            >
              <SelectTrigger id="act-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

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
        <Label htmlFor="act-description">Description</Label>
        <Textarea id="act-description" {...register("description")} rows={3} placeholder="Details..." />
      </div>

      <Button type="submit" disabled={isSubmitting} size="sm">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Save Changes" : isReminder ? "Create Reminder" : "Log Activity"}
      </Button>
    </form>
  )
}
