import { getUsers } from "@/actions/settings"
import { UsersTable } from "@/components/settings/users-table"

export default async function UsersPage() {
  const { users, currentUserId, currentRole } = await getUsers()

  return (
    <UsersTable
      users={users}
      currentUserId={currentUserId}
      currentRole={currentRole}
    />
  )
}
