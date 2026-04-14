"use server"

import { prisma } from "@/lib/prisma"
import { companySchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getCompanies() {
  return await prisma.company.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: {
        select: { contacts: true, deals: true, activities: true, reminders: true, children: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getCompany(id: string) {
  return await prisma.company.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        include: {
          _count: { select: { contacts: true, deals: true } },
        },
        orderBy: { name: "asc" },
      },
      contacts: {
        orderBy: { lastName: "asc" },
      },
      deals: {
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
      },
      reminders: {
        orderBy: { dueDate: "asc" },
      },
    },
  })
}

export async function createCompany(data: unknown) {
  const validated = companySchema.parse(data)

  const result = await prisma.company.create({
    data: {
      name: validated.name,
      parentId: validated.parentId || null,
      industry: validated.industry,
      website: validated.website,
      location: validated.location,
      revenue: validated.revenue,
      employeeCount: validated.employeeCount,
      description: validated.description,
      notes: validated.notes,
      status: validated.status,
    },
  })

  revalidatePath("/companies")
  revalidatePath("/")
  return { success: true, id: result.id }
}

export async function updateCompany(id: string, data: unknown) {
  const validated = companySchema.parse(data)

  await prisma.company.update({
    where: { id },
    data: {
      name: validated.name,
      parentId: validated.parentId || null,
      industry: validated.industry,
      website: validated.website,
      location: validated.location,
      revenue: validated.revenue,
      employeeCount: validated.employeeCount,
      description: validated.description,
      notes: validated.notes,
      status: validated.status,
    },
  })

  revalidatePath("/companies")
  revalidatePath(`/companies/${id}`)
  revalidatePath("/")
  return { success: true }
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({
    where: { id },
  })

  revalidatePath("/companies")
  revalidatePath("/")
  return { success: true }
}
