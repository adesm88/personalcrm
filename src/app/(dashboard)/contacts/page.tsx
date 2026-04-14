import Link from "next/link"
import { getContacts } from "@/actions/contacts"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { CONTACT_ROLE_LABELS } from "@/lib/schemas"
import { Plus, Users, ExternalLink } from "lucide-react"

export default async function ContactsPage() {
  let contacts: Awaited<ReturnType<typeof getContacts>> = []
  try {
    contacts = await getContacts()
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">{contacts.length} contacts in your network</p>
        </div>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No contacts yet</p>
              <p className="text-xs mt-1">Add people to your network</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/contacts/new"><Plus className="mr-2 h-3 w-3" /> Add Contact</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">Deals</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="group">
                    <TableCell>
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-primary hover:underline">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {contact.company ? (
                        <Link href={`/companies/${contact.company.id}`} className="text-muted-foreground hover:underline">
                          {contact.company.name}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{contact.title || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={contact.role} label={CONTACT_ROLE_LABELS[contact.role]} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{contact.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{contact.phone || "—"}</TableCell>
                    <TableCell className="text-center">{contact._count.deals}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" asChild>
                        <Link href={`/contacts/${contact.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
