import { getModules } from "@/actions/modules"
import { ModulesList } from "@/components/settings/modules-list"

export default async function ModulesPage() {
  const modules = await getModules()

  return <ModulesList modules={modules} />
}
