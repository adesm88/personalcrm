"use client"

import { useState } from "react"
import { updateNote, deleteNote } from "@/actions/notes"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Trash2, X, Check, StickyNote } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface NoteItem {
  id: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface NoteListProps {
  notes: NoteItem[]
}

export function NoteList({ notes }: NoteListProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const startEdit = (note: NoteItem) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const saveEdit = async (noteId: string) => {
    if (!editContent.trim()) return
    setSavingId(noteId)
    try {
      await updateNote(noteId, { content: editContent.trim() })
      toast.success("Note updated")
      setEditingId(null)
      setEditContent("")
      router.refresh()
    } catch {
      toast.error("Failed to update note")
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId)
    try {
      await deleteNote(noteId)
      toast.success("Note deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete note")
    } finally {
      setDeletingId(null)
    }
  }

  if (notes.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <StickyNote className="h-5 w-5 opacity-40" />
        No notes yet
      </div>
    )
  }

  return (
    <div className="divide-y">
      {notes.map((note) => (
        <div key={note.id} className="py-4 first:pt-0 last:pb-0 group">
          {editingId === note.id ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => saveEdit(note.id)}
                  disabled={savingId === note.id || !editContent.trim()}
                >
                  {savingId === note.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => startEdit(note)}
                    title="Edit note"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    title="Delete note"
                  >
                    {deletingId === note.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {formatDateTime(note.createdAt)}
                {note.updatedAt !== note.createdAt && (
                  <span className="ml-2 italic">(edited {formatDateTime(note.updatedAt)})</span>
                )}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
