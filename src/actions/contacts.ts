"use server"

import { prisma } from "@/lib/prisma"
import { contactSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getContacts() {
  return await prisma.contact.findMany({
    include: {
      company: {
        select: { id: true, name: true },
      },
      _count: {
        select: { deals: true, activities: true },
      },
    },
    orderBy: { lastName: "asc" },
  })
}

export async function getContact(id: string) {
  return await prisma.contact.findUnique({
    where: { id },
    include: {
      company: true,
      deals: {
        include: {
          deal: {
            select: { id: true, name: true, stage: true, priority: true },
          },
        },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 20,
      },
      entityNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function createContact(data: unknown) {
  const validated = contactSchema.parse(data)

  // If a new company name was provided, create the company first
  let companyId = validated.companyId || null
  if (!companyId && validated.newCompanyName?.trim()) {
    const newCompany = await prisma.company.create({
      data: { name: validated.newCompanyName.trim() },
    })
    companyId = newCompany.id
  }

  const result = await prisma.contact.create({
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      companyId,
      email: validated.email || null,
      phone: validated.phone,
      title: validated.title,
      linkedIn: validated.linkedIn,
      role: validated.role,
      notes: validated.notes,
    },
  })

  revalidatePath("/contacts")
  revalidatePath("/companies")
  revalidatePath("/")
  return { success: true, id: result.id }
}

export async function updateContact(id: string, data: unknown) {
  const validated = contactSchema.parse(data)

  await prisma.contact.update({
    where: { id },
    data: {
      firstName: validated.firstName,
      lastName: validated.lastName,
      companyId: validated.companyId || null,
      email: validated.email || null,
      phone: validated.phone,
      title: validated.title,
      linkedIn: validated.linkedIn,
      role: validated.role,
      notes: validated.notes,
    },
  })

  revalidatePath("/contacts")
  revalidatePath(`/contacts/${id}`)
  return { success: true }
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({
    where: { id },
  })

  revalidatePath("/contacts")
  revalidatePath("/")
  return { success: true }
}
