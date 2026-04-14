import { getCompanies } from "@/actions/companies"
import { ContactForm } from "@/components/contact-form"

export default async function NewContactPage() {
  let companies: { id: string; name: string }[] = []
  try {
    const allCompanies = await getCompanies()
    companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
  } catch {}

  return (
    <div className="max-w-2xl mx-auto">
      <ContactForm companies={companies} />
    </div>
  )
}
