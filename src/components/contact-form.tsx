"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, type ContactFormData, CONTACT_ROLE_LABELS } from "@/lib/schemas"
import { createContact, updateContact } from "@/actions/contacts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Plus, X } from "lucide-react"

interface ContactFormProps {
  initialData?: ContactFormData & { id?: string }
  companies: { id: string; name: string }[]
}

export function ContactForm({ initialData, companies }: ContactFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id
  const [creatingNewCompany, setCreatingNewCompany] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema) as any,
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      companyId: null,
      newCompanyName: "",
      email: "",
      phone: "",
      title: "",
      linkedIn: "",
      role: "OTHER",
      notes: "",
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && initialData?.id) {
        await updateContact(initialData.id, data)
        toast.success("Contact updated")
        router.push(`/contacts/${initialData.id}`)
      } else {
        const result = await createContact(data)
        toast.success("Contact created")
        router.push(`/contacts/${result.id}`)
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  function handleCreateNewCompany() {
    setCreatingNewCompany(true)
    setValue("companyId", null)
    setValue("newCompanyName", "")
  }

  function handleCancelNewCompany() {
    setCreatingNewCompany(false)
    setValue("newCompanyName", "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit" : "New"} Contact</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...register("firstName")} placeholder="First name" />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...register("lastName")} placeholder="Last name" />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              {creatingNewCompany ? (
                <div className="flex gap-2">
                  <Input
                    {...register("newCompanyName")}
                    placeholder="New company name"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 cursor-pointer"
                    onClick={handleCancelNewCompany}
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
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
                  <button
                    type="button"
                    onClick={handleCreateNewCompany}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    Create new company
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={watch("role")}
                onValueChange={(v) => setValue("role", v as ContactFormData["role"])}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTACT_ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="email@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register("title")} placeholder="e.g. VP of Operations" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input id="linkedIn" {...register("linkedIn")} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} placeholder="Notes about this contact..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Contact"}
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

