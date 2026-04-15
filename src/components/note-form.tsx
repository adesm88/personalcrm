"use client"

import { useState } from "react"
import { createNote } from "@/actions/notes"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"

interface NoteFormProps {
  dealId?: string
  contactId?: string
  companyId?: string
}

export function NoteForm({ dealId, contactId, companyId }: NoteFormProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await createNote({
        content: content.trim(),
        dealId: dealId || null,
        contactId: contactId || null,
        companyId: companyId || null,
      })
      toast.success("Note added")
      setContent("")
      router.refresh()
    } catch {
      toast.error("Failed to add note")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note..."
        rows={3}
        className="resize-none"
      />
      <Button type="submit" disabled={isSubmitting || !content.trim()} size="sm">
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Add Note
      </Button>
    </form>
  )
}
