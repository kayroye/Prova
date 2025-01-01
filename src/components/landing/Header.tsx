'use client'

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, History, Settings, User, Menu } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

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
    href: "/profile", 
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

// Create a reusable link style
const linkStyles = `
  relative
  flex items-center gap-2 
  text-sm font-medium 
  px-3 py-2 rounded-md 
  transition-colors
  hover:text-primary
  after:content-['']
  after:absolute
  after:w-0
  after:h-[2px]
  after:bottom-0
  after:left-0
  after:bg-primary
  after:transition-all
  after:duration-300
  hover:after:w-full
`;

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center space-x-4">
          {session && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`${linkStyles} ${isActive ? 'bg-muted text-primary after:w-full' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link href="/" className="flex items-center group">
            <span className="text-xl md:text-2xl font-bold relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-primary after:transition-all after:duration-300 group-hover:after:w-full">
              Prova
            </span>
          </Link>

          {session && (
            <nav className="hidden md:flex items-center space-x-4">
              <TooltipProvider>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`${linkStyles} ${isActive ? 'bg-muted text-primary after:w-full' : ''}`}
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