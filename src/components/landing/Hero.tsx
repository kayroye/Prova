'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

export function Hero() {
  const { data: session, status } = useSession()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Talk to Your APIs
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">
              Interact with APIs using natural language. Test, debug, and manage your API interactions effortlessly.
            </p>
          </div>
          <div className="space-x-4">
            {status === "loading" ? (
              <Button size="lg" disabled>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Loading
              </Button>
            ) : session ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Dashboard
                  <Icons.externalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 