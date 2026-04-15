"use server"

import { prisma } from "@/lib/prisma"
import { noteSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function createNote(data: unknown) {
  const validated = noteSchema.parse(data)

  const result = await prisma.note.create({
    data: {
      content: validated.content,
      dealId: validated.dealId || null,
      contactId: validated.contactId || null,
      companyId: validated.companyId || null,
    },
  })

  // Revalidate the relevant entity pages
  if (validated.contactId) revalidatePath(`/contacts/${validated.contactId}`)
  if (validated.companyId) revalidatePath(`/companies/${validated.companyId}`)
  if (validated.dealId) revalidatePath(`/deals/${validated.dealId}`)

  return { success: true, id: result.id }
}

export async function updateNote(id: string, data: unknown) {
  const validated = noteSchema.parse(data)

  const note = await prisma.note.update({
    where: { id },
    data: {
      content: validated.content,
    },
  })

  if (note.contactId) revalidatePath(`/contacts/${note.contactId}`)
  if (note.companyId) revalidatePath(`/companies/${note.companyId}`)
  if (note.dealId) revalidatePath(`/deals/${note.dealId}`)

  return { success: true }
}

export async function deleteNote(id: string) {
  const note = await prisma.note.delete({
    where: { id },
  })

  if (note.contactId) revalidatePath(`/contacts/${note.contactId}`)
  if (note.companyId) revalidatePath(`/companies/${note.companyId}`)
  if (note.dealId) revalidatePath(`/deals/${note.dealId}`)

  return { success: true }
}
