"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { checkLoginAttempts, recordFailedLoginAttempt, resetLoginAttempts } from "@/lib/auth/password-reset";
import { MFAVerify } from "./mfa-verify";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showMfa, setShowMfa] = React.useState(false);
  const [credentials, setCredentials] = React.useState({ email: "", password: "" });
  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setCredentials({ email, password });

    if (!checkLoginAttempts(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Too many failed attempts. Please try again later or reset your password.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error === "MFA_REQUIRED") {
        setShowMfa(true);
        setIsLoading(false);
        return;
      }

      if (result?.error) {
        recordFailedLoginAttempt(email);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        resetLoginAttempts(email);
        router.push("/dashboard");
        toast({
          title: "Success",
          description: "Successfully logged in!",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleMfaVerify = async (token: string) => {
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        mfaToken: token,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      resetLoginAttempts(credentials.email);
      router.push("/dashboard");
      toast({
        title: "Success",
        description: "Successfully logged in!",
      });
    } catch (error) {
      throw error; // Let MFAVerify component handle the error
    }
  };

  if (showMfa) {
    return (
      <MFAVerify 
        onVerify={handleMfaVerify}
        onCancel={() => setShowMfa(false)}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>
            <Button disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </div>
        </form>
        <Button
          variant="link"
          className="px-0 text-sm mt-2"
          onClick={() => router.push("/forgot-password")}
        >
          Forgot password?
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          >
            <Icons.gitHub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => router.push("/signup")}
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
} 