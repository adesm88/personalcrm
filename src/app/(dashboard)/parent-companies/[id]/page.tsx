import Link from "next/link"
import { notFound } from "next/navigation"
import { getParentCompany, deleteParentCompany } from "@/actions/parent-companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"
import { COMPANY_STATUS_LABELS } from "@/lib/schemas"
import { ArrowLeft, Edit, Building2, ExternalLink } from "lucide-react"
import { DeleteButton } from "@/components/delete-button"

export default async function ParentCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const parentCompany = await getParentCompany(id)
  if (!parentCompany) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parent-companies"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{parentCompany.name}</h1>
          {parentCompany.industry && (
            <p className="text-muted-foreground">{parentCompany.industry}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/parent-companies/${id}/edit`}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit
            </Link>
          </Button>
          <DeleteButton id={id} action={deleteParentCompany} redirectTo="/parent-companies" label="Delete" />
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {parentCompany.website && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Website</p>
                <a href={parentCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  {parentCompany.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {parentCompany.notes && (
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Notes</p>
                <p className="whitespace-pre-wrap">{parentCompany.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subsidiaries */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">
              Subsidiaries ({parentCompany.companies.length})
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/companies/new?parentCompanyId=${id}`}>
                <Building2 className="mr-2 h-3 w-3" /> Add Company
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {parentCompany.companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Building2 className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No subsidiaries yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Contacts</TableHead>
                    <TableHead className="text-center">Deals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentCompany.companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <Link href={`/companies/${company.id}`} className="font-medium text-primary hover:underline">
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={company.status} label={COMPANY_STATUS_LABELS[company.status]} />
                      </TableCell>
                      <TableCell className="text-center">{company._count.contacts}</TableCell>
                      <TableCell className="text-center">{company._count.deals}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
