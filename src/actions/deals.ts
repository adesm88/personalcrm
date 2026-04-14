"use server"

import { prisma } from "@/lib/prisma"
import { dealSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getDeals() {
  return await prisma.deal.findMany({
    include: {
      company: {
        select: { id: true, name: true },
      },
      contacts: {
        include: {
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      _count: {
        select: { activities: true, reminders: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getDeal(id: string) {
  return await prisma.deal.findUnique({
    where: { id },
    include: {
      company: true,
      contacts: {
        include: {
          contact: true,
        },
      },
      activities: {
        orderBy: { date: "desc" },
        take: 30,
      },
      reminders: {
        orderBy: { dueDate: "asc" },
      },
    },
  })
}

export async function getDealsByStage() {
  const deals = await prisma.deal.findMany({
    include: {
      company: {
        select: { id: true, name: true },
      },
      _count: {
        select: { activities: true, reminders: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Group by stage
  const stages = [
    "LEAD",
    "INITIAL_CONTACT",
    "NDA_SIGNED",
    "DUE_DILIGENCE",
    "LOI",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]

  const grouped: Record<string, typeof deals> = {}
  for (const stage of stages) {
    grouped[stage] = deals.filter((d) => d.stage === stage)
  }

  return grouped
}

export async function createDeal(data: unknown) {
  const validated = dealSchema.parse(data)
  const { contactIds, ...dealData } = validated

  const result = await prisma.deal.create({
    data: {
      name: dealData.name,
      companyId: dealData.companyId || null,
      stage: dealData.stage,
      askingPrice: dealData.askingPrice,
      revenue: dealData.revenue,
      ebitda: dealData.ebitda,
      currency: dealData.currency,
      expectedCloseDate: dealData.expectedCloseDate,
      source: dealData.source,
      notes: dealData.notes,
      priority: dealData.priority,
      ...(contactIds && contactIds.length > 0
        ? {
            contacts: {
              create: contactIds.map((contactId) => ({
                contactId,
              })),
            },
          }
        : {}),
    },
  })

  revalidatePath("/deals")
  revalidatePath("/")
  return { success: true, id: result.id }
}

export async function updateDeal(id: string, data: unknown) {
  const validated = dealSchema.parse(data)
  const { contactIds, ...dealData } = validated

  // Update deal and replace contacts
  await prisma.$transaction(async (tx) => {
    await tx.deal.update({
      where: { id },
      data: {
        name: dealData.name,
        companyId: dealData.companyId || null,
        stage: dealData.stage,
        askingPrice: dealData.askingPrice,
        revenue: dealData.revenue,
        ebitda: dealData.ebitda,
        currency: dealData.currency,
        expectedCloseDate: dealData.expectedCloseDate,
        source: dealData.source,
        notes: dealData.notes,
        priority: dealData.priority,
      },
    })

    // Replace contact associations
    if (contactIds !== undefined) {
      await tx.dealContact.deleteMany({ where: { dealId: id } })
      if (contactIds.length > 0) {
        await tx.dealContact.createMany({
          data: contactIds.map((contactId) => ({
            dealId: id,
            contactId,
          })),
        })
      }
    }
  })

  revalidatePath("/deals")
  revalidatePath(`/deals/${id}`)
  revalidatePath("/")
  return { success: true }
}

export async function updateDealStage(id: string, stage: string) {
  await prisma.deal.update({
    where: { id },
    data: { stage: stage as never },
  })

  revalidatePath("/deals")
  revalidatePath(`/deals/${id}`)
  revalidatePath("/")
  return { success: true }
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({
    where: { id },
  })

  revalidatePath("/deals")
  revalidatePath("/")
  return { success: true }
}
