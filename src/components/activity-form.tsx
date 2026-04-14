"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { activitySchema, type ActivityFormData, ACTIVITY_TYPE_LABELS } from "@/lib/schemas"
import { createActivity } from "@/actions/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ActivityFormProps {
  dealId?: string
  contactId?: string
  companyId?: string
  deals?: { id: string; name: string }[]
  contacts?: { id: string; firstName: string; lastName: string }[]
  companies?: { id: string; name: string }[]
  onSuccess?: () => void
}

export function ActivityForm({
  dealId,
  contactId,
  companyId,
  deals = [],
  contacts = [],
  companies = [],
  onSuccess,
}: ActivityFormProps) {
  const router = useRouter()

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
    defaultValues: {
      dealId: dealId || null,
      contactId: contactId || null,
      companyId: companyId || null,
      type: "NOTE",
      subject: "",
      description: "",
      date: new Date(),
    },
  })

  const onSubmit = async (data: ActivityFormData) => {
    try {
      await createActivity(data)
      toast.success("Activity logged")
      reset()
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch {
      toast.error("Failed to log activity")
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
            <SelectTrigger id="act-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="act-date">Date</Label>
          <Input id="act-date" type="datetime-local" {...register("date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="act-subject">Subject *</Label>
        <Input id="act-subject" {...register("subject")} placeholder="Brief summary..." />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      {/* Show entity selectors only if not pre-set */}
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
        Log Activity
      </Button>
    </form>
  )
}
