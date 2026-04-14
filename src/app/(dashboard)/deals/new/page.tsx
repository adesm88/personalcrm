import { getCompanies } from "@/actions/companies"
import { getContacts } from "@/actions/contacts"
import { DealForm } from "@/components/deal-form"

export default async function NewDealPage() {
  let companies: { id: string; name: string }[] = []
  let contacts: { id: string; firstName: string; lastName: string }[] = []
  try {
    const [allCompanies, allContacts] = await Promise.all([
      getCompanies(),
      getContacts(),
    ])
    companies = allCompanies.map((c) => ({ id: c.id, name: c.name }))
    contacts = allContacts.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
    }))
  } catch {}

  return (
    <div className="max-w-2xl mx-auto">
      <DealForm companies={companies} contacts={contacts} />
    </div>
  )
}
