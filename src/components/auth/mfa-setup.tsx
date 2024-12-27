"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface MFASetupProps {
  userId: string
  onSetupComplete: () => void
}

export function MFASetup({ userId, onSetupComplete }: MFASetupProps) {
  const [step, setStep] = useState<"initial" | "verify">("initial")
  const [setupData, setSetupData] = useState<{ secret: string; backupCodes: string[]; otpauthUrl: string } | null>(null)
  const [token, setToken] = useState("")

  const startSetup = async () => {
    try {
      const response = await fetch("/api/auth/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      
      if (!response.ok) throw new Error("Failed to start MFA setup")
      
      const data = await response.json()
      setSetupData(data)
      setStep("verify")
    } catch (err) {
      toast.error(`Failed to start MFA setup: ${(err as Error).message}`)
    }
  }

  const verifyAndEnable = async () => {
    try {
      const response = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      })
      
      if (!response.ok) throw new Error("Invalid verification code")
      
      toast.success("MFA enabled successfully")
      onSetupComplete()
    } catch (err) {
      toast.error(`Failed to verify code: ${(err as Error).message}`)
    }
  }

  if (step === "initial") {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Protect your account with two-factor authentication using an authenticator app.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={startSetup}>Begin Setup</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Scan this QR code with your authenticator app, then enter the code shown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {setupData && (
          <>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCode value={setupData.otpauthUrl} />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app:</p>
              <InputOTP
                value={token}
                onChange={setToken}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {setupData.backupCodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Backup Codes</p>
                <p className="text-sm text-muted-foreground">Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.</p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                  {setupData.backupCodes.map((code, i) => (
                    <code key={i} className="text-sm">{code}</code>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={verifyAndEnable}
          disabled={token.length !== 6}
        >
          Verify and Enable
        </Button>
      </CardFooter>
    </Card>
  )
} 