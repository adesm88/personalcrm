import { notFound } from "next/navigation"
import { getContact } from "@/actions/contacts"
import { getCompanies } from "@/actions/companies"
import { ContactForm } from "@/components/contact-form"

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [contact, allCompanies] = await Promise.all([
    getContact(id),
    getCompanies(),
  ])
  if (!contact) notFound()

  return (
    <div>
      <ContactForm
        initialData={{
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          companyId: contact.companyId,
          email: contact.email,
          phone: contact.phone,
          title: contact.title,
          linkedIn: contact.linkedIn,
          role: contact.role,
          notes: contact.notes,
        }}
        companies={allCompanies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
