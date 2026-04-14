"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { parentCompanySchema, type ParentCompanyFormData } from "@/lib/schemas"
import { createParentCompany, updateParentCompany } from "@/actions/parent-companies"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ParentCompanyFormProps {
  initialData?: ParentCompanyFormData & { id?: string }
}

export function ParentCompanyForm({ initialData }: ParentCompanyFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ParentCompanyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(parentCompanySchema) as any,
    defaultValues: initialData || {
      name: "",
      industry: "",
      website: "",
      notes: "",
    },
  })

  const onSubmit = async (data: ParentCompanyFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateParentCompany(initialData.id, data)
        toast.success("Parent company updated")
        router.push(`/parent-companies/${initialData.id}`)
      } else {
        const result = await createParentCompany(data)
        toast.success("Parent company created")
        router.push(`/parent-companies/${result.id}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit" : "New"} Parent Company</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="Holding group name" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" {...register("industry")} placeholder="e.g. Manufacturing" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={4} placeholder="Additional notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Parent Company"}
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
