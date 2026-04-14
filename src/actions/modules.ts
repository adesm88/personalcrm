"use server"

import { prisma } from "@/lib/prisma"

// ─── Module Queries ──────────────────────────────────────────────────

export async function getModules() {
  return prisma.crmModule.findMany({
    include: {
      _count: { select: { fields: true } },
    },
    orderBy: { sortOrder: "asc" },
  })
}

export async function getModuleWithFields(slug: string) {
  const mod = await prisma.crmModule.findUnique({
    where: { slug },
    include: {
      fields: {
        orderBy: { sortOrder: "asc" },
      },
    },
  })
  if (!mod) throw new Error("Module not found")
  return mod
}

// ─── Module Toggle ───────────────────────────────────────────────────

export async function toggleModule(moduleId: string, enabled: boolean) {
  await prisma.crmModule.update({
    where: { id: moduleId },
    data: { enabled },
  })
  return { success: true }
}

// ─── Field CRUD ──────────────────────────────────────────────────────

export async function createField(
  moduleId: string,
  data: {
    label: string
    fieldType: string
    isRequired: boolean
    section: string
    placeholder?: string
    options?: string[]
  }
) {
  // Generate a slug from the label
  const name = data.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  // Check for duplicates
  const existing = await prisma.moduleField.findUnique({
    where: { moduleId_name: { moduleId, name } },
  })
  if (existing) {
    return { error: "A field with this name already exists." }
  }

  // Get max sort order
  const maxField = await prisma.moduleField.findFirst({
    where: { moduleId },
    orderBy: { sortOrder: "desc" },
  })
  const sortOrder = (maxField?.sortOrder ?? 0) + 1

  const field = await prisma.moduleField.create({
    data: {
      moduleId,
      name,
      label: data.label,
      fieldType: data.fieldType as never,
      isSystem: false,
      isRequired: data.isRequired,
      isVisible: true,
      sortOrder,
      section: data.section || null,
      placeholder: data.placeholder || null,
      options: data.options ? JSON.stringify(data.options) : null,
    },
  })

  return { success: true, field }
}

export async function updateField(
  fieldId: string,
  data: {
    label?: string
    fieldType?: string
    isRequired?: boolean
    isVisible?: boolean
    section?: string
    placeholder?: string
    options?: string[]
  }
) {
  const field = await prisma.moduleField.findUnique({ where: { id: fieldId } })
  if (!field) return { error: "Field not found." }

  // System fields can only update visibility and sort order
  const updateData: Record<string, unknown> = {}

  if (data.isVisible !== undefined) updateData.isVisible = data.isVisible
  if (data.section !== undefined) updateData.section = data.section

  if (!field.isSystem) {
    if (data.label !== undefined) updateData.label = data.label
    if (data.fieldType !== undefined) updateData.fieldType = data.fieldType
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired
    if (data.placeholder !== undefined) updateData.placeholder = data.placeholder
    if (data.options !== undefined)
      updateData.options = JSON.stringify(data.options)
  }

  await prisma.moduleField.update({
    where: { id: fieldId },
    data: updateData,
  })

  return { success: true }
}

export async function deleteField(fieldId: string) {
  const field = await prisma.moduleField.findUnique({ where: { id: fieldId } })
  if (!field) return { error: "Field not found." }
  if (field.isSystem) return { error: "System fields cannot be deleted." }

  // Delete all values for this field
  await prisma.customFieldValue.deleteMany({ where: { fieldId } })
  await prisma.moduleField.delete({ where: { id: fieldId } })

  return { success: true }
}

export async function reorderFields(
  moduleId: string,
  fieldIds: string[]
) {
  const updates = fieldIds.map((id, index) =>
    prisma.moduleField.update({
      where: { id },
      data: { sortOrder: index + 1 },
    })
  )

  await prisma.$transaction(updates)
  return { success: true }
}
