"use server"

import { prisma } from "@/lib/prisma"
import { activitySchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getActivities(limit = 50) {
  return await prisma.activity.findMany({
    include: {
      deal: {
        select: { id: true, name: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true },
      },
      company: {
        select: { id: true, name: true },
      },
    },
    orderBy: { date: "desc" },
    take: limit,
  })
}

export async function createActivity(data: unknown) {
  const validated = activitySchema.parse(data)

  const result = await prisma.activity.create({
    data: {
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
      type: validated.type,
      subject: validated.subject,
      description: validated.description,
      date: validated.date,
    },
  })

  revalidatePath("/activities")
  revalidatePath("/")
  if (validated.dealId) revalidatePath(`/deals/${validated.dealId}`)
  if (validated.contactId) revalidatePath(`/contacts/${validated.contactId}`)
  if (validated.companyId) revalidatePath(`/companies/${validated.companyId}`)
  return { success: true, id: result.id }
}

export async function updateActivity(id: string, data: unknown) {
  const validated = activitySchema.parse(data)

  await prisma.activity.update({
    where: { id },
    data: {
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
      type: validated.type,
      subject: validated.subject,
      description: validated.description,
      date: validated.date,
    },
  })

  revalidatePath("/activities")
  return { success: true }
}

export async function deleteActivity(id: string) {
  await prisma.activity.delete({
    where: { id },
  })

  revalidatePath("/activities")
  revalidatePath("/")
  return { success: true }
}
