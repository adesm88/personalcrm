import { getParentCompanies } from "@/actions/parent-companies"
import { CompanyForm } from "@/components/company-form"

export default async function NewCompanyPage() {
  let parentCompanies: { id: string; name: string }[] = []
  try {
    const pcs = await getParentCompanies()
    parentCompanies = pcs.map((pc) => ({ id: pc.id, name: pc.name }))
  } catch {
    // DB not connected
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CompanyForm parentCompanies={parentCompanies} />
    </div>
  )
}
