"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className="flex items-center space-x-2"
      >
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold">SalesCallerAI</span>
      </Link>
      <Link
        href="/leads"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/leads"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Leads
      </Link>
      <Link
        href="/calls"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/calls"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Calls
      </Link>
      <Link
        href="/orders"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/orders"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Orders
      </Link>
      <Link
        href="/reports"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/reports"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Reports
      </Link>
    </nav>
  )
}
