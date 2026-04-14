"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserRole, deleteUser, createUser } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Shield, Crown } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  currentUserId: string
  currentRole: string
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  MEMBER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  OWNER: <Crown className="h-3 w-3" />,
  ADMIN: <Shield className="h-3 w-3" />,
}

export function UsersTable({ users, currentUserId, currentRole }: UsersTableProps) {
  const router = useRouter()
  const isOwner = currentRole === "OWNER"

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER")
  const [inviting, setInviting] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)

    try {
      const result = await createUser({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
        setInviteOpen(false)
        setInviteName("")
        setInviteEmail("")
        setInviteRole("MEMBER")
        router.refresh()
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    const result = await updateUserRole(userId, role as "ADMIN" | "MEMBER" | "VIEWER")
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.refresh()
    }
  }

  async function handleDelete(userId: string, userName: string | null) {
    if (!confirm(`Are you sure you want to delete ${userName || "this user"}?`)) return

    const result = await deleteUser(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage who has access to your CRM.
            </CardDescription>
          </div>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new account. They&apos;ll receive an email to set their password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as "ADMIN" | "MEMBER" | "VIEWER")}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={inviting}>
                    {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {isOwner && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || "—"}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  {isOwner && user.role !== "OWNER" && user.id !== currentUserId ? (
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      className={`${ROLE_COLORS[user.role] || ""} gap-1`}
                      variant="secondary"
                    >
                      {ROLE_ICONS[user.role]}
                      {user.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                {isOwner && (
                  <TableCell>
                    {user.id !== currentUserId && user.role !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
