import { getModules } from "@/actions/modules"
import { ModulesList } from "@/components/settings/modules-list"

export const dynamic = "force-dynamic"

export default async function ModulesPage() {
  const modules = await getModules()

  return <ModulesList modules={modules} />
}
