"use server"

import { prisma } from "@/lib/prisma"
import { reminderSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function getReminder(id: string) {
  return await prisma.reminder.findUnique({
    where: { id },
    include: {
      deal: { select: { id: true, name: true } },
      contact: { select: { id: true, firstName: true, lastName: true } },
      company: { select: { id: true, name: true } },
    },
  })
}

export async function getReminders(includeCompleted = false) {
  return await prisma.reminder.findMany({
    where: includeCompleted
      ? {}
      : {
          status: {
            in: ["PENDING", "IN_PROGRESS"],
          },
        },
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
    orderBy: { dueDate: "asc" },
  })
}

export async function getUpcomingReminders(days = 7) {
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)

  return await prisma.reminder.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lte: future },
    },
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
    orderBy: { dueDate: "asc" },
  })
}

export async function getOverdueCount() {
  return await prisma.reminder.count({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { lt: new Date() },
    },
  })
}

export async function createReminder(data: unknown) {
  const validated = reminderSchema.parse(data)

  const result = await prisma.reminder.create({
    data: {
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
      title: validated.title,
      description: validated.description,
      dueDate: validated.dueDate,
      priority: validated.priority,
      status: validated.status,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/")
  if (validated.dealId) revalidatePath(`/deals/${validated.dealId}`)
  if (validated.contactId) revalidatePath(`/contacts/${validated.contactId}`)
  if (validated.companyId) revalidatePath(`/companies/${validated.companyId}`)
  return { success: true, id: result.id }
}

export async function updateReminder(id: string, data: unknown) {
  const validated = reminderSchema.parse(data)

  await prisma.reminder.update({
    where: { id },
    data: {
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
      title: validated.title,
      description: validated.description,
      dueDate: validated.dueDate,
      priority: validated.priority,
      status: validated.status,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/")
  return { success: true }
}

export async function updateReminderStatus(id: string, status: string) {
  await prisma.reminder.update({
    where: { id },
    data: { status: status as never },
  })

  revalidatePath("/reminders")
  revalidatePath("/")
  return { success: true }
}

export async function deleteReminder(id: string) {
  await prisma.reminder.delete({
    where: { id },
  })

  revalidatePath("/reminders")
  revalidatePath("/")
  return { success: true }
}
