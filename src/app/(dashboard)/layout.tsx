import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { getOverdueCount } from "@/actions/reminders"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let overdueCount = 0
  try {
    overdueCount = await getOverdueCount()
  } catch {
    // DB might not be connected yet
  }

  return (
    <SidebarProvider>
      <AppSidebar overdueCount={overdueCount} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
