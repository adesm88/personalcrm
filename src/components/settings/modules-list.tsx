"use client"

import { useRouter } from "next/navigation"
import { toggleModule } from "@/actions/modules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Building2,
  Users,
  Handshake,
  Activity,
  Bell,
  Puzzle,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

interface Module {
  id: string
  slug: string
  name: string
  icon: string | null
  enabled: boolean
  sortOrder: number
  _count: { fields: number }
}

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Users,
  Handshake,
  Activity,
  Bell,
}

interface ModulesListProps {
  modules: Module[]
}

export function ModulesList({ modules }: ModulesListProps) {
  const router = useRouter()

  async function handleToggle(moduleId: string, enabled: boolean) {
    try {
      await toggleModule(moduleId, enabled)
      toast.success(enabled ? "Module enabled" : "Module disabled")
      router.refresh()
    } catch {
      toast.error("Something went wrong.")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">CRM Modules</h2>
        <p className="text-sm text-muted-foreground">
          Configure the modules in your CRM. Click a module to manage its fields.
        </p>
      </div>

      <div className="grid gap-3">
        {modules.map((mod) => {
          const Icon = ICON_MAP[mod.icon || ""] || Puzzle

          return (
            <Card
              key={mod.id}
              className={`transition-all ${!mod.enabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-center">
                <Link
                  href={`/settings/modules/${mod.slug}`}
                  className="flex-1 flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors rounded-l-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{mod.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {mod._count.fields} fields
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{mod.slug}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>

                <div className="px-4 border-l">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mod.enabled}
                      onChange={(e) => handleToggle(mod.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
