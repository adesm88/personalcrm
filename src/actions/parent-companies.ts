"use server"

import { prisma } from "@/lib/prisma"
import { parentCompanySchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getParentCompanies() {
  return await prisma.parentCompany.findMany({
    include: {
      _count: {
        select: { companies: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getParentCompany(id: string) {
  return await prisma.parentCompany.findUnique({
    where: { id },
    include: {
      companies: {
        include: {
          _count: {
            select: { contacts: true, deals: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  })
}

export async function createParentCompany(data: unknown) {
  const validated = parentCompanySchema.parse(data)

  const result = await prisma.parentCompany.create({
    data: {
      name: validated.name,
      industry: validated.industry,
      website: validated.website,
      notes: validated.notes,
    },
  })

  revalidatePath("/parent-companies")
  return { success: true, id: result.id }
}

export async function updateParentCompany(id: string, data: unknown) {
  const validated = parentCompanySchema.parse(data)

  await prisma.parentCompany.update({
    where: { id },
    data: {
      name: validated.name,
      industry: validated.industry,
      website: validated.website,
      notes: validated.notes,
    },
  })

  revalidatePath("/parent-companies")
  revalidatePath(`/parent-companies/${id}`)
  return { success: true }
}

export async function deleteParentCompany(id: string) {
  await prisma.parentCompany.delete({
    where: { id },
  })

  revalidatePath("/parent-companies")
  return { success: true }
}
