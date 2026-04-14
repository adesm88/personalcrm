import { notFound } from "next/navigation"
import { getDeal } from "@/actions/deals"
import { getCompanies } from "@/actions/companies"
import { getContacts } from "@/actions/contacts"
import { DealForm } from "@/components/deal-form"

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [deal, allCompanies, allContacts] = await Promise.all([
    getDeal(id),
    getCompanies(),
    getContacts(),
  ])
  if (!deal) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <DealForm
        initialData={{
          id: deal.id,
          name: deal.name,
          companyId: deal.companyId,
          stage: deal.stage,
          askingPrice: deal.askingPrice ? Number(deal.askingPrice) : null,
          revenue: deal.revenue ? Number(deal.revenue) : null,
          ebitda: deal.ebitda ? Number(deal.ebitda) : null,
          currency: deal.currency,
          expectedCloseDate: deal.expectedCloseDate,
          source: deal.source,
          notes: deal.notes,
          priority: deal.priority,
          contactIds: deal.contacts.map((dc) => dc.contact.id),
        }}
        companies={allCompanies.map((c) => ({ id: c.id, name: c.name }))}
        contacts={allContacts.map((c) => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
        }))}
      />
    </div>
  )
}
