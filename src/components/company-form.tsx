"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companySchema, type CompanyFormData, COMPANY_STATUS_LABELS } from "@/lib/schemas"
import { createCompany, updateCompany } from "@/actions/companies"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CompanyFormProps {
  initialData?: CompanyFormData & { id?: string }
  parentCompanies: { id: string; name: string }[]
}

export function CompanyForm({ initialData, parentCompanies }: CompanyFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companySchema) as any,
    defaultValues: initialData || {
      name: "",
      parentCompanyId: null,
      industry: "",
      website: "",
      location: "",
      revenue: "",
      employeeCount: "",
      description: "",
      notes: "",
      status: "PROSPECT",
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateCompany(initialData.id, data)
        toast.success("Company updated")
        router.push(`/companies/${initialData.id}`)
      } else {
        const result = await createCompany(data)
        toast.success("Company created")
        router.push(`/companies/${result.id}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit" : "New"} Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" {...register("name")} placeholder="Company name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as CompanyFormData["status"])}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPANY_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentCompanyId">Parent Company</Label>
              <Select
                value={watch("parentCompanyId") || "none"}
                onValueChange={(v) => setValue("parentCompanyId", v === "none" ? null : v)}
              >
                <SelectTrigger id="parentCompanyId">
                  <SelectValue placeholder="Select parent company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentCompanies.map((pc) => (
                    <SelectItem key={pc.id} value={pc.id}>{pc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register("industry")} placeholder="e.g. SaaS, Manufacturing" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="City, State/Province" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue</Label>
              <Input id="revenue" {...register("revenue")} placeholder="e.g. $5M-$10M" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Employees</Label>
              <Input id="employeeCount" {...register("employeeCount")} placeholder="e.g. 50-100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} placeholder="Brief company description..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} placeholder="Internal notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Company"}
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
