import { notFound } from "next/navigation"
import { getCompany, getCompanies } from "@/actions/companies"
import { CompanyForm } from "@/components/company-form"

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [company, allCompanies] = await Promise.all([
    getCompany(id),
    getCompanies(),
  ])
  if (!company) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <CompanyForm
        initialData={{
          id: company.id,
          name: company.name,
          parentId: company.parentId,
          industry: company.industry,
          website: company.website,
          location: company.location,
          revenue: company.revenue,
          employeeCount: company.employeeCount,
          description: company.description,
          notes: company.notes,
          status: company.status,
        }}
        companies={allCompanies.map((c) => ({ id: c.id, name: c.name }))}
        excludeId={id}
      />
    </div>
  )
}
