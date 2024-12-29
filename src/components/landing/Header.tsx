'use client'

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, History, Settings, User } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    label: "Dashboard",
    description: "View and manage your API endpoints"
  },
  { 
    href: "/dashboard/history", 
    icon: History, 
    label: "API History",
    description: "See your past API interactions"
  },
  { 
    href: "/dashboard/profile", 
    icon: User, 
    label: "Profile",
    description: "Manage your account settings"
  },
  { 
    href: "/dashboard/settings", 
    icon: Settings, 
    label: "Settings",
    description: "Configure your API preferences"
  },
];

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">TalkToAPI</span>
          </Link>

          {session && (
            <nav className="hidden md:flex items-center space-x-6">
              <TooltipProvider>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </nav>
          )}
        </div>

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 