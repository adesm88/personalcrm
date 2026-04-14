"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserCog, Users, Puzzle } from "lucide-react"

const tabs = [
  { name: "Account", href: "/settings/account", icon: UserCog },
  { name: "Users", href: "/settings/users", icon: Users },
  { name: "Modules", href: "/settings/modules", icon: Puzzle },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, team, and CRM configuration.
        </p>
      </div>

      <SettingsTabs />

      <div>{children}</div>
    </div>
  )
}

function SettingsTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-6">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/settings/account"
              ? pathname === "/settings" || pathname === "/settings/account"
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
