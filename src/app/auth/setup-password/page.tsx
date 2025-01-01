import { Metadata } from "next"
import { SetupPasswordForm } from "@/components/auth/setup-password-form"

export const metadata: Metadata = {
  title: "Setup Password - Prova",
  description: "Set up your account password",
}

export default function SetupPassword() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[400px] md:max-w-[450px]">
        <SetupPasswordForm />
      </div>
    </main>
  )
} 