import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import authOptions from "@/app/api/auth/authOptions"
import { SettingsContent } from "@/components/dashboard/settings-content"

export const metadata: Metadata = {
  title: "Settings - TalkToAPI",
  description: "Manage your account settings and security",
}

export default async function Settings() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsContent userId={session.user.id} />
    </div>
  )
} 