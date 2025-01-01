import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import authOptions from "@/app/api/auth/authOptions"
import { SettingsContent } from "@/components/dashboard/settings-content"

export const metadata: Metadata = {
  title: "Settings - Prova",
  description: "Manage your account settings and security",
}

export default async function Settings() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex-1">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <SettingsContent userId={session.user.id} />
        </div>
      </main>
    </div>
  )
} 