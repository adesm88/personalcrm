import { notFound } from "next/navigation"
import { getCompany } from "@/actions/companies"
import { getParentCompanies } from "@/actions/parent-companies"
import { CompanyForm } from "@/components/company-form"

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [company, parentCompanies] = await Promise.all([
    getCompany(id),
    getParentCompanies(),
  ])
  if (!company) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <CompanyForm
        initialData={{
          id: company.id,
          name: company.name,
          parentCompanyId: company.parentCompanyId,
          industry: company.industry,
          website: company.website,
          location: company.location,
          revenue: company.revenue,
          employeeCount: company.employeeCount,
          description: company.description,
          notes: company.notes,
          status: company.status,
        }}
        parentCompanies={parentCompanies.map((pc) => ({ id: pc.id, name: pc.name }))}
      />
    </div>
  )
}
