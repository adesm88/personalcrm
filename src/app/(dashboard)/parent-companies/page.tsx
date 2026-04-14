import Link from "next/link"
import { getParentCompanies } from "@/actions/parent-companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Building, ExternalLink } from "lucide-react"

export default async function ParentCompaniesPage() {
  let parentCompanies: Awaited<ReturnType<typeof getParentCompanies>> = []
  try {
    parentCompanies = await getParentCompanies()
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Companies</h1>
          <p className="text-muted-foreground">Holding groups and parent entities</p>
        </div>
        <Button asChild>
          <Link href="/parent-companies/new">
            <Plus className="mr-2 h-4 w-4" /> Add Parent Company
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {parentCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No parent companies yet</p>
              <p className="text-xs mt-1">Add a holding group or parent entity to get started</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/parent-companies/new">
                  <Plus className="mr-2 h-3 w-3" /> Add Parent Company
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-center">Subsidiaries</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentCompanies.map((pc) => (
                  <TableRow key={pc.id} className="group">
                    <TableCell>
                      <Link href={`/parent-companies/${pc.id}`} className="font-medium text-primary hover:underline">
                        {pc.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{pc.industry || "—"}</TableCell>
                    <TableCell>
                      {pc.website ? (
                        <a href={pc.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          {pc.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium">
                        {pc._count.companies}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" asChild>
                        <Link href={`/parent-companies/${pc.id}`}>
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
