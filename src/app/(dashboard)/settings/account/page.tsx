import { getAccount } from "@/actions/settings"
import { AccountForm } from "@/components/settings/account-form"

export default async function AccountPage() {
  const account = await getAccount()

  return <AccountForm account={account} />
}
