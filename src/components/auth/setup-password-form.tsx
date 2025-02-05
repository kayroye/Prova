"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signIn } from "next-auth/react"

export function SetupPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get("email")
  const name = searchParams.get("name")
  const provider = searchParams.get("provider")
  const providerAccountId = searchParams.get("provider_account_id")
  const avatarUrl = searchParams.get("avatar_url")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirm") as string

      if (password !== confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      if (!email || !name || !provider || !providerAccountId) {
        toast.error("Missing required information")
        return
      }

      // Create the user through our API endpoint
      const response = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          provider,
          providerAccountId,
          avatarUrl
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      // Sign in with NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success("Account setup complete")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set Up Your Password</CardTitle>
        <CardDescription>
          Please create a password for your account. You&apos;ll be able to use this to sign in directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email || ""}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              disabled={isLoading}
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              placeholder="Confirm your password"
              disabled={isLoading}
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Password must:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Be at least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one lowercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character (@$!%*?&)</li>
            </ul>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 