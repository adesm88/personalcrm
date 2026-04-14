import { getModuleWithFields } from "@/actions/modules"
import { FieldEditor } from "@/components/settings/field-editor"

export default async function ModuleFieldsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const mod = await getModuleWithFields(slug)

  return <FieldEditor module={mod} />
}
