"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  updateField,
  deleteField,
  reorderFields,
  createField,
} from "@/actions/modules"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  ChevronUp,
  ChevronDown,
  Loader2,
  GripVertical,
} from "lucide-react"

interface ModuleField {
  id: string
  moduleId: string
  name: string
  label: string
  fieldType: string
  isSystem: boolean
  isRequired: boolean
  isVisible: boolean
  sortOrder: number
  options: string | null
  placeholder: string | null
  section: string | null
}

interface FieldEditorProps {
  module: {
    id: string
    slug: string
    name: string
    fields: ModuleField[]
  }
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: "Text",
  TEXTAREA: "Long Text",
  NUMBER: "Number",
  DECIMAL: "Decimal",
  DATE: "Date",
  SELECT: "Dropdown",
  MULTI_SELECT: "Multi-Select",
  BOOLEAN: "Checkbox",
  URL: "URL",
  EMAIL: "Email",
  PHONE: "Phone",
}

const FIELD_TYPE_COLORS: Record<string, string> = {
  TEXT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  TEXTAREA: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  NUMBER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  DECIMAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  DATE: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  SELECT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  MULTI_SELECT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  BOOLEAN: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  URL: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  EMAIL: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  PHONE: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
}

export function FieldEditor({ module }: FieldEditorProps) {
  const router = useRouter()
  const [fields, setFields] = useState(module.fields)
  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newType, setNewType] = useState("TEXT")
  const [newRequired, setNewRequired] = useState(false)
  const [newSection, setNewSection] = useState("")
  const [newPlaceholder, setNewPlaceholder] = useState("")
  const [newOptions, setNewOptions] = useState("")
  const [adding, setAdding] = useState(false)

  // Group fields by section
  const sections = Array.from(new Set(fields.map((f) => f.section || "Other")))

  async function handleToggleVisibility(field: ModuleField) {
    const result = await updateField(field.id, { isVisible: !field.isVisible })
    if (result.error) {
      toast.error(result.error)
    } else {
      setFields((prev) =>
        prev.map((f) =>
          f.id === field.id ? { ...f, isVisible: !f.isVisible } : f
        )
      )
    }
  }

  async function handleDelete(field: ModuleField) {
    if (!confirm(`Delete the "${field.label}" field? All data in this field will be lost.`)) return

    const result = await deleteField(field.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setFields((prev) => prev.filter((f) => f.id !== field.id))
      toast.success("Field deleted")
    }
  }

  async function handleMove(field: ModuleField, direction: "up" | "down") {
    const idx = fields.findIndex((f) => f.id === field.id)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === fields.length - 1) return

    const newFields = [...fields]
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    ;[newFields[idx], newFields[swapIdx]] = [newFields[swapIdx], newFields[idx]]

    setFields(newFields)

    const result = await reorderFields(
      module.id,
      newFields.map((f) => f.id)
    )
    if (!result.success) {
      toast.error("Failed to reorder")
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)

    try {
      const options =
        newType === "SELECT" || newType === "MULTI_SELECT"
          ? newOptions
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined

      const result = await createField(module.id, {
        label: newLabel,
        fieldType: newType,
        isRequired: newRequired,
        section: newSection || "Custom Fields",
        placeholder: newPlaceholder || undefined,
        options,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Field created")
        setAddOpen(false)
        setNewLabel("")
        setNewType("TEXT")
        setNewRequired(false)
        setNewSection("")
        setNewPlaceholder("")
        setNewOptions("")
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings/modules">
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold">{module.name}</h2>
            <p className="text-sm text-muted-foreground">
              {fields.length} fields — manage layout and custom fields
            </p>
          </div>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Add a new field to the {module.name} module.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="field-label">Label</Label>
                <Input
                  id="field-label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Annual Revenue Growth"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="field-type">Type</Label>
                  <Select value={newType} onValueChange={setNewType}>
                    <SelectTrigger id="field-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FIELD_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field-section">Section</Label>
                  <Input
                    id="field-section"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="e.g. Financial"
                  />
                </div>
              </div>

              {(newType === "SELECT" || newType === "MULTI_SELECT") && (
                <div className="space-y-2">
                  <Label htmlFor="field-options">
                    Options (one per line)
                  </Label>
                  <textarea
                    id="field-options"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newOptions}
                    onChange={(e) => setNewOptions(e.target.value)}
                    placeholder={"Option A\nOption B\nOption C"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="field-placeholder">Placeholder (optional)</Label>
                <Input
                  id="field-placeholder"
                  value={newPlaceholder}
                  onChange={(e) => setNewPlaceholder(e.target.value)}
                  placeholder="e.g. Enter value..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="field-required" className="text-sm font-normal cursor-pointer">
                  This field is required
                </Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={adding}>
                  {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Field
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.map((section) => {
        const sectionFields = fields.filter(
          (f) => (f.section || "Other") === section
        )
        if (sectionFields.length === 0) return null

        return (
          <div key={section} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
              {section}
            </h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sectionFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        !field.isVisible ? "opacity-40" : ""
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {field.label}
                          </span>
                          {field.isSystem && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          {field.isRequired && (
                            <span className="text-xs text-destructive">*</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {field.name}
                        </span>
                      </div>

                      <Badge
                        className={`${FIELD_TYPE_COLORS[field.fieldType] || ""} text-[10px] font-medium`}
                        variant="secondary"
                      >
                        {FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => handleMove(field, "up")}
                          disabled={idx === 0 && sectionFields[0] === fields[0]}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => handleMove(field, "down")}
                          disabled={
                            idx === sectionFields.length - 1 &&
                            sectionFields[sectionFields.length - 1] ===
                              fields[fields.length - 1]
                          }
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          onClick={() => handleToggleVisibility(field)}
                          title={field.isVisible ? "Hide field" : "Show field"}
                        >
                          {field.isVisible ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </Button>

                        {!field.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
                            onClick={() => handleDelete(field)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
