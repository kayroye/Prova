'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
          Interact with APIs Effortlessly
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Leverage the power of conversational interfaces to manage your API interactions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">
              Sign Up
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg"
            onClick={scrollToFeatures}
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
} 