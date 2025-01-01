"use client";

import { User } from "next-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ProfileInfoProps {
  user: User;
  profile: {
    user_id: string;
    role: "free" | "premium";
    created_at: string;
    updated_at: string;
  } | null;
}

export default function ProfileInfo({ user, profile }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.name || "");
  
  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="max-w-md"
              />
              <p className="text-sm text-muted-foreground">
                Your email address is managed through your authentication provider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="flex gap-2 items-start max-w-md">
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                />
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleSave} variant="default">
                      Save
                    </Button>
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(user.name || "");
                      }} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <p className="text-sm font-medium">
                {profile?.role === "premium" ? "Premium User" : "Free User"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm font-medium">
                {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 