'use client'

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { useEffect, useState } from "react"

const phrases = ["Talk to", "Test", "Debug", "Manage", "Automate"];

export function Hero() {
  const { data: session, status } = useSession()
  const [text, setText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  useEffect(() => {
    const animateText = async () => {
      const currentPhrase = phrases[currentPhraseIndex]
      
      // Type the phrase
      for (let i = 0; i <= currentPhrase.length; i++) {
        setText(currentPhrase.slice(0, i))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Pause at the end of the phrase
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Delete the phrase
      for (let i = currentPhrase.length; i >= 0; i--) {
        setText(currentPhrase.slice(0, i))
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Move to the next phrase
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }

    animateText()
  }, [currentPhraseIndex])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded">{text}</span>{showCursor && <span className="animate-blink">|</span>} Your APIs
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
                <Link href="/signup">
                  Get Started
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

