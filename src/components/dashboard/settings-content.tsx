"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MFASetup } from "@/components/auth/mfa-setup"
import { Button } from "@/components/ui/button"
import { Shield, Key } from "lucide-react"

interface SettingsContentProps {
  userId: string
}

interface SecuritySettings {
  mfaEnabled: boolean
}

export function SettingsContent({ userId }: SettingsContentProps) {
  const [settings, setSettings] = useState<SecuritySettings>({ mfaEnabled: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/auth/settings")
        if (!response.ok) throw new Error("Failed to load settings")
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        toast.error(`Failed to load settings: ${(err as Error).message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleDisableMFA = async () => {
    try {
      const response = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to disable MFA")

      setSettings(prev => ({ ...prev, mfaEnabled: false }))
      toast.success("MFA disabled successfully")
    } catch (err) {
      toast.error(`Failed to disable MFA: ${(err as Error).message}`)
    }
  }

  return (
    <Tabs defaultValue="security" className="space-y-4">
      <TabsList>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring both your password and an authentication code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : settings.mfaEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Key className="h-4 w-4" />
                  Two-factor authentication is enabled
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDisableMFA}
                >
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <MFASetup 
                userId={userId} 
                onSetupComplete={() => {
                  setSettings(prev => ({ ...prev, mfaEnabled: true }))
                }} 
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 