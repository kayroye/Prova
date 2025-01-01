"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Icons } from "@/components/ui/icons";

interface SecuritySettingsProps {
  userId: string;
  mfaEnabled: boolean;
  connectedProviders: string[];
}

export default function SecuritySettings({ 
  mfaEnabled: initialMfaEnabled, 
  connectedProviders 
}: SecuritySettingsProps) {
  const [mfaEnabled] = useState(initialMfaEnabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleMfaToggle = async () => {
    setIsLoading(true);
    // TODO: Implement MFA toggle functionality
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    // TODO: Implement password change functionality
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or reset it if you&apos;ve forgotten it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePasswordChange} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="mfa"
              checked={mfaEnabled}
              onCheckedChange={handleMfaToggle}
              disabled={isLoading}
            />
            <Label htmlFor="mfa">Enable two-factor authentication</Label>
          </div>
          {mfaEnabled && (
            <p className="mt-2 text-sm text-muted-foreground">
              Two-factor authentication is enabled. You&apos;ll need to enter a code from your authenticator app when signing in.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected authentication providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icons.google className="h-5 w-5" />
                <Label>Google</Label>
              </div>
              <Button 
                variant={connectedProviders.includes("google") ? "destructive" : "outline"}
                size="sm"
              >
                {connectedProviders.includes("google") ? "Disconnect" : "Connect"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icons.gitHub className="h-5 w-5" />
                <Label>GitHub</Label>
              </div>
              <Button 
                variant={connectedProviders.includes("github") ? "destructive" : "outline"}
                size="sm"
              >
                {connectedProviders.includes("github") ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 