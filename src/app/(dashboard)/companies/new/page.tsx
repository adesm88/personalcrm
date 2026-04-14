import { getCompanies } from "@/actions/companies"
import { CompanyForm } from "@/components/company-form"

export default async function NewCompanyPage() {
  let companies: { id: string; name: string }[] = []
  try {
    const allCompanies = await getCompanies()
    companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
  } catch {}

  return (
    <div>
      <CompanyForm companies={companies} />
    </div>
  )
}
