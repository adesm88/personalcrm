"use client"

import { useState } from "react"
import { updateAccount } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AccountFormProps {
  account: {
    id: string
    name: string | null
    email: string | null
    role: string
  }
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

export function AccountForm({ account }: AccountFormProps) {
  const [name, setName] = useState(account.name || "")
  const [email, setEmail] = useState(account.email || "")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateAccount({ name, email })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Profile</CardTitle>
          <Badge className={ROLE_COLORS[account.role] || ""} variant="secondary">
            {account.role}
          </Badge>
        </div>
        <CardDescription>
          Update your name and email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
