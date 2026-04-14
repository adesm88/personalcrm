"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

// ─── Forgot Password ────────────────────────────────────────────────
// Always returns a success-like message so attackers can't enumerate emails.

export async function forgotPassword(email: string) {
  try {
    if (!email || typeof email !== "string") {
      return { error: "Please enter a valid email address." };
    }

    const normalised = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalised },
    });

    // Even if no user, we return the same message (anti-enumeration)
    if (!user) {
      return {
        success:
          "If an account with that email exists, we've sent a password reset link.",
      };
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalised },
    });

    // Generate a secure token — 48 bytes → 64-char hex string
    const token = randomBytes(48).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: normalised,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(normalised, token);

    return {
      success:
        "If an account with that email exists, we've sent a password reset link.",
    };
  } catch (error) {
    console.error("[forgotPassword]", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

// ─── Reset Password ─────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || typeof token !== "string") {
      return { error: "Invalid reset link." };
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { error: "Invalid or expired reset link." };
    }

    if (resetToken.expires < new Date()) {
      // Clean up the expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return { error: "This reset link has expired. Please request a new one." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { success: "Password reset successfully. You can now log in." };
  } catch (error) {
    console.error("[resetPassword]", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

// ─── Sign Up ─────────────────────────────────────────────────────────

export async function signUp(name: string, email: string, password: string) {
  try {
    if (!email || typeof email !== "string") {
      return { error: "Please enter a valid email address." };
    }

    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return { error: "Please enter your name." };
    }

    const normalised = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalised },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalised,
        password: hashedPassword,
      },
    });

    return { success: "Account created successfully. Please sign in." };
  } catch (error) {
    console.error("[signUp]", error);
    return { error: "Something went wrong. Please try again later." };
  }
}
