"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface MFAVerifyProps {
  onVerify: (token: string) => Promise<void>
  onCancel: () => void
}

export function MFAVerify({ onVerify, onCancel }: MFAVerifyProps) {
  const [token, setToken] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    try {
      setIsVerifying(true)
      await onVerify(token)
    } catch (err) {
      toast.error(`Verification failed: ${(err as Error).message}`)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the verification code from your authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          <p className="text-sm text-muted-foreground">
            Lost access to your authenticator app?{" "}
            <button 
              onClick={() => setToken("")} 
              className="text-primary hover:underline"
            >
              Use a backup code
            </button>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isVerifying}
        >
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          disabled={token.length !== 6 || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </CardFooter>
    </Card>
  )
} 