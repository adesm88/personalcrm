import { z }from "zod"

// --- Company ---
export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  parentId: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  revenue: z.string().optional().nullable(),
  employeeCount: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum([
    "PROSPECT",
    "UNDER_REVIEW",
    "IN_DUE_DILIGENCE",
    "OFFER_MADE",
    "CLOSED",
    "PASSED",
    "PORTFOLIO",
  ]).default("PROSPECT"),
})
export type CompanyFormData = z.infer<typeof companySchema>

// --- Contact ---
export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyId: z.string().optional().nullable(),
  newCompanyName: z.string().optional().nullable(), // When creating a new company inline
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  linkedIn: z.string().optional().nullable(),
  role: z.enum([
    "OWNER",
    "CEO",
    "CFO",
    "BROKER",
    "ADVISOR",
    "EMPLOYEE",
    "BOARD_MEMBER",
    "OTHER",
  ]).default("OTHER"),
  notes: z.string().optional().nullable(),
})
export type ContactFormData = z.infer<typeof contactSchema>

// --- Deal ---
export const dealSchema = z.object({
  name: z.string().min(1, "Deal name is required"),
  companyId: z.string().optional().nullable(),
  stage: z.enum([
    "LEAD",
    "INITIAL_CONTACT",
    "NDA_SIGNED",
    "DUE_DILIGENCE",
    "LOI",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]).default("LEAD"),
  askingPrice: z.coerce.number().optional().nullable(),
  revenue: z.coerce.number().optional().nullable(),
  ebitda: z.coerce.number().optional().nullable(),
  currency: z.string().default("USD"),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  contactIds: z.array(z.string()).optional().default([]),
})
export type DealFormData = z.infer<typeof dealSchema>

// --- Activity ---
export const activitySchema = z.object({
  dealId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  type: z.enum([
    "NOTE",
    "CALL",
    "EMAIL",
    "MEETING",
    "SITE_VISIT",
    "OTHER",
  ]).default("NOTE"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional().nullable(),
  date: z.coerce.date().default(() => new Date()),
})
export type ActivityFormData = z.infer<typeof activitySchema>

// --- Reminder ---
export const reminderSchema = z.object({
  dealId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  dueDate: z.coerce.date(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
})
export type ReminderFormData = z.infer<typeof reminderSchema>

// --- Label Maps for Display ---
export const COMPANY_STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  UNDER_REVIEW: "Under Review",
  IN_DUE_DILIGENCE: "In Due Diligence",
  OFFER_MADE: "Offer Made",
  CLOSED: "Closed",
  PASSED: "Passed",
  PORTFOLIO: "Portfolio",
}

export const DEAL_STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead",
  INITIAL_CONTACT: "Initial Contact",
  NDA_SIGNED: "NDA Signed",
  DUE_DILIGENCE: "Due Diligence",
  LOI: "LOI",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
}

export const DEAL_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
}

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  CEO: "CEO",
  CFO: "CFO",
  BROKER: "Broker",
  ADVISOR: "Advisor",
  EMPLOYEE: "Employee",
  BOARD_MEMBER: "Board Member",
  OTHER: "Other",
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  SITE_VISIT: "Site Visit",
  OTHER: "Other",
}

export const REMINDER_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
}

export const REMINDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}
