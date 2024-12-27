import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TalkToAPI. All rights reserved.
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link 
            href="/privacy" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link 
            href="/terms" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link 
            href="/contact" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
} 