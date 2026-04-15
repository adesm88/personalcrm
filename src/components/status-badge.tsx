"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  // Company status
  PROSPECT: "bg-blue-100 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
  IN_DUE_DILIGENCE: "bg-purple-100 text-purple-700 border-purple-200",
  OFFER_MADE: "bg-orange-100 text-orange-700 border-orange-200",
  CLOSED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PASSED: "bg-gray-100 text-gray-500 border-gray-200",
  PORTFOLIO: "bg-teal-100 text-teal-700 border-teal-200",

  // Deal stages
  LEAD: "bg-slate-100 text-slate-600 border-slate-200",
  INITIAL_CONTACT: "bg-sky-100 text-sky-700 border-sky-200",
  NDA_SIGNED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  DUE_DILIGENCE: "bg-purple-100 text-purple-700 border-purple-200",
  LOI: "bg-violet-100 text-violet-700 border-violet-200",
  NEGOTIATION: "bg-amber-100 text-amber-700 border-amber-200",
  CLOSED_WON: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED_LOST: "bg-red-100 text-red-600 border-red-200",

  // Priority
  LOW: "bg-slate-100 text-slate-600 border-slate-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  URGENT: "bg-red-100 text-red-700 border-red-200",

  // Reminder status
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",

  // Activity types
  NOTE: "bg-slate-100 text-slate-600 border-slate-200",
  CALL: "bg-green-100 text-green-700 border-green-200",
  EMAIL: "bg-blue-100 text-blue-700 border-blue-200",
  MEETING: "bg-purple-100 text-purple-700 border-purple-200",
  SITE_VISIT: "bg-teal-100 text-teal-700 border-teal-200",
  REMINDER: "bg-amber-100 text-amber-700 border-amber-200",
  OTHER: "bg-gray-100 text-gray-600 border-gray-200",

  // Contact roles
  OWNER: "bg-amber-100 text-amber-700 border-amber-200",
  CEO: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CFO: "bg-violet-100 text-violet-700 border-violet-200",
  BROKER: "bg-teal-100 text-teal-700 border-teal-200",
  ADVISOR: "bg-cyan-100 text-cyan-700 border-cyan-200",
  EMPLOYEE: "bg-slate-100 text-slate-600 border-slate-200",
  BOARD_MEMBER: "bg-purple-100 text-purple-700 border-purple-200",
}

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-600 border-gray-200"
  const displayLabel =
    label ||
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border px-2 py-0.5",
        colorClass,
        className
      )}
    >
      {displayLabel}
    </Badge>
  )
}
