"use server"

import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendPasswordResetEmail } from "@/lib/email"
import { randomBytes } from "crypto"

// ─── Helpers ─────────────────────────────────────────────────────────

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Not authenticated")
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) throw new Error("User not found")
  return user
}

// ─── Account ─────────────────────────────────────────────────────────

export async function getAccount() {
  const user = await getCurrentUser()
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export async function updateAccount(data: { name: string; email: string }) {
  const user = await getCurrentUser()

  if (data.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    })
    if (existing && existing.id !== user.id) {
      return { error: "This email is already in use." }
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
    },
  })

  return { success: "Account updated." }
}

// ─── User Management ────────────────────────────────────────────────

export async function getUsers() {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN") {
    throw new Error("Insufficient permissions")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return { users, currentUserId: currentUser.id, currentRole: currentUser.role }
}

export async function createUser(data: {
  name: string
  email: string
  role: "ADMIN" | "MEMBER" | "VIEWER"
}) {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== "OWNER" && currentUser.role !== "ADMIN") {
    return { error: "Insufficient permissions." }
  }

  const email = data.email.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "A user with this email already exists." }
  }

  // Generate a temporary password
  const tempPassword = randomBytes(8).toString("hex")
  const hashedPassword = await bcrypt.hash(tempPassword, 12)

  await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      password: hashedPassword,
      role: data.role,
    },
  })

  // Send a password reset email so the user can set their own password
  try {
    const token = randomBytes(48).toString("hex")
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days for invites

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    })

    await sendPasswordResetEmail(email, token)
  } catch (e) {
    console.error("[createUser] Failed to send invite email:", e)
    // Don't fail the creation if email fails
  }

  return { success: `User ${email} created. A password reset email has been sent.` }
}

export async function updateUserRole(
  userId: string,
  role: "ADMIN" | "MEMBER" | "VIEWER"
) {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== "OWNER") {
    return { error: "Only the owner can change user roles." }
  }

  if (userId === currentUser.id) {
    return { error: "You cannot change your own role." }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return { success: "User role updated." }
}

export async function deleteUser(userId: string) {
  const currentUser = await getCurrentUser()
  if (currentUser.role !== "OWNER") {
    return { error: "Only the owner can delete users." }
  }

  if (userId === currentUser.id) {
    return { error: "You cannot delete your own account." }
  }

  await prisma.user.delete({ where: { id: userId } })

  return { success: "User deleted." }
}
