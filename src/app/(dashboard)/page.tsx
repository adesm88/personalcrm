import Link from "next/link"
import { Building2, Users, Handshake, Bell, Activity, ArrowRight } from "lucide-react"
import { StatCard, StatsGrid } from "@/components/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { EntityActivityTimeline } from "@/components/entity-activity-timeline"
import { DEAL_STAGE_LABELS, DEAL_PRIORITY_LABELS } from "@/lib/schemas"
import { formatDate, formatCurrency } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

async function getDashboardData() {
  try {
    const [
      companyCount,
      contactCount,
      activeDeals,
      overdueReminders,
      recentDeals,
      upcomingReminders,
      recentActivities,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.contact.count(),
      prisma.deal.count({
        where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } },
      }),
      prisma.activity.count({
        where: {
          type: "REMINDER",
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.deal.findMany({
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.activity.findMany({
        where: {
          type: "REMINDER",
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        include: {
          deal: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      prisma.activity.findMany({
        include: {
          deal: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
        take: 8,
      }),
    ])

    return {
      companyCount,
      contactCount,
      activeDeals,
      overdueReminders,
      recentDeals,
      upcomingReminders,
      recentActivities,
    }
  } catch {
    return {
      companyCount: 0,
      contactCount: 0,
      activeDeals: 0,
      overdueReminders: 0,
      recentDeals: [],
      upcomingReminders: [],
      recentActivities: [],
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your acquisition pipeline</p>
      </div>

      {/* Stats */}
      <StatsGrid>
        <StatCard
          title="Companies"
          value={data.companyCount}
          icon={Building2}
          subtitle="Total tracked"
        />
        <StatCard
          title="Contacts"
          value={data.contactCount}
          icon={Users}
          subtitle="In your network"
        />
        <StatCard
          title="Active Deals"
          value={data.activeDeals}
          icon={Handshake}
          subtitle="In pipeline"
        />
        <StatCard
          title="Overdue"
          value={data.overdueReminders}
          icon={Bell}
          subtitle="Reminders past due"
          className={data.overdueReminders > 0 ? "border-red-200 bg-red-50/30" : ""}
        />
      </StatsGrid>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Deals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/deals" className="text-xs">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Handshake className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No deals yet</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/deals/new">Create your first deal</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-all hover:shadow-sm hover:border-primary/20"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{deal.name}</p>
                      {deal.company && (
                        <p className="text-xs text-muted-foreground">{deal.company.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <StatusBadge status={deal.stage} label={DEAL_STAGE_LABELS[deal.stage]} />
                      <StatusBadge status={deal.priority} label={DEAL_PRIORITY_LABELS[deal.priority]} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Reminders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/activities" className="text-xs">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No upcoming reminders</p>
              </div>
            ) : (
              <EntityActivityTimeline activities={data.upcomingReminders} />
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/activities" className="text-xs">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No activities logged yet</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {data.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">{activity.subject}</p>
                        <StatusBadge status={activity.type} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(activity.date)}</span>
                        {activity.deal && (
                          <Link href={`/deals/${activity.deal.id}`} className="text-xs text-primary hover:underline">
                            {activity.deal.name}
                          </Link>
                        )}
                        {activity.company && (
                          <Link href={`/companies/${activity.company.id}`} className="text-xs text-primary hover:underline">
                            {activity.company.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
