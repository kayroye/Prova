import { Metadata } from "next"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { Demo } from "@/components/landing/Demo"
import { Footer } from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "TalkToAPI - Interact with APIs Effortlessly",
  description: "Leverage the power of conversational interfaces to manage your API interactions. Test, debug, and interact with APIs using natural language.",
  keywords: "API, LLM, conversation, testing, debugging, developer tools",
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <Hero />
        <Demo />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
