"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealSchema, type DealFormData, DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS } from "@/lib/schemas"
import { createDeal, updateDeal } from "@/actions/deals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface DealFormProps {
  initialData?: DealFormData & { id?: string }
  companies: { id: string; name: string }[]
  contacts: { id: string; firstName: string; lastName: string }[]
}

export function DealForm({ initialData, companies, contacts }: DealFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DealFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(dealSchema) as any,
    defaultValues: initialData || {
      name: "",
      companyId: null,
      stage: "LEAD",
      askingPrice: null,
      revenue: null,
      ebitda: null,
      currency: "USD",
      expectedCloseDate: null,
      source: "",
      notes: "",
      priority: "MEDIUM",
      contactIds: [],
    },
  })

  const onSubmit = async (data: DealFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateDeal(initialData.id, data)
        toast.success("Deal updated")
        router.push(`/deals/${initialData.id}`)
      } else {
        const result = await createDeal(data)
        toast.success("Deal created")
        router.push(`/deals/${result.id}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit" : "New"} Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Deal Name *</Label>
              <Input id="name" {...register("name")} placeholder="Deal name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              <Select
                value={watch("companyId") || "none"}
                onValueChange={(v) => setValue("companyId", v === "none" ? null : v)}
              >
                <SelectTrigger id="companyId">
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={watch("stage")}
                onValueChange={(v) => setValue("stage", v as DealFormData["stage"])}
              >
                <SelectTrigger id="stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_STAGE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) => setValue("priority", v as DealFormData["priority"])}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DEAL_PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" {...register("source")} placeholder="e.g. Broker, Direct" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price</Label>
              <Input id="askingPrice" type="number" step="0.01" {...register("askingPrice")} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue</Label>
              <Input id="revenue" type="number" step="0.01" {...register("revenue")} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebitda">EBITDA</Label>
              <Input id="ebitda" type="number" step="0.01" {...register("ebitda")} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} placeholder="USD" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                {...register("expectedCloseDate")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Linked Contacts</Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto rounded-md border p-3">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">No contacts available</p>
              ) : (
                contacts.map((contact) => {
                  const currentIds = watch("contactIds") || []
                  const isChecked = currentIds.includes(contact.id)
                  return (
                    <label
                      key={contact.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1.5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValue("contactIds", [...currentIds, contact.id])
                          } else {
                            setValue("contactIds", currentIds.filter((id) => id !== contact.id))
                          }
                        }}
                        className="rounded"
                      />
                      {contact.firstName} {contact.lastName}
                    </label>
                  )
                })
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={4} placeholder="Deal notes, key terms, considerations..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Deal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
