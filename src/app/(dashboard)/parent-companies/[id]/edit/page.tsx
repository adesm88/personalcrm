import { notFound } from "next/navigation"
import { getParentCompany } from "@/actions/parent-companies"
import { ParentCompanyForm } from "@/components/parent-company-form"

export default async function EditParentCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const parentCompany = await getParentCompany(id)
  if (!parentCompany) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <ParentCompanyForm
        initialData={{
          id: parentCompany.id,
          name: parentCompany.name,
          industry: parentCompany.industry,
          website: parentCompany.website,
          notes: parentCompany.notes,
        }}
      />
    </div>
  )
}
