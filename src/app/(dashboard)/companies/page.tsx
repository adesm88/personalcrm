import Link from "next/link"
import { getCompanies } from "@/actions/companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { COMPANY_STATUS_LABELS } from "@/lib/schemas"
import { Plus, Building2, ExternalLink } from "lucide-react"

export default async function CompaniesPage() {
  let companies: Awaited<ReturnType<typeof getCompanies>> = []
  try {
    companies = await getCompanies()
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">{companies.length} companies tracked</p>
        </div>
        <Button asChild>
          <Link href="/companies/new">
            <Plus className="mr-2 h-4 w-4" /> Add Company
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No companies yet</p>
              <p className="text-xs mt-1">Start tracking acquisition targets</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/companies/new">
                  <Plus className="mr-2 h-3 w-3" /> Add Company
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Contacts</TableHead>
                  <TableHead className="text-center">Deals</TableHead>
                  <TableHead className="text-center">Subs</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="group">
                    <TableCell>
                      <Link href={`/companies/${company.id}`} className="font-medium text-primary hover:underline">
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {company.parent ? (
                        <Link href={`/companies/${company.parent.id}`} className="text-muted-foreground hover:underline">
                          {company.parent.name}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{company.industry || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={company.status} label={COMPANY_STATUS_LABELS[company.status]} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{company.location || "—"}</TableCell>
                    <TableCell className="text-center">{company._count.contacts}</TableCell>
                    <TableCell className="text-center">{company._count.deals}</TableCell>
                    <TableCell className="text-center">
                      {company._count.children > 0 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
                          {company._count.children}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" asChild>
                        <Link href={`/companies/${company.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
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
