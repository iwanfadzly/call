"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useSession } from "next-auth/react"

interface SideNavProps extends React.HTMLAttributes<HTMLElement> { className?: string }

export function SideNav({ className, ...props }: SideNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const isAdmin = role === 'ADMIN'
  const isManager = ['ADMIN', 'MANAGER'].includes(role as string)
  const isAgent = ['ADMIN', 'MANAGER', 'AGENT'].includes(role as string)

  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          pathname === "/dashboard"
            ? "bg-muted hover:bg-muted"
            : "hover:bg-transparent hover:underline",
          "justify-start"
        )}
      >
        <Icons.laptop className="mr-2 h-4 w-4" />
        Dashboard
      </Link>
      {isAgent && (
        <>
          <Link
            href="/leads"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/leads"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icons.user className="mr-2 h-4 w-4" />
            Lead Management
          </Link>
          <Link
            href="/calls"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/calls"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icons.phone className="mr-2 h-4 w-4" />
            Call Center
          </Link>
          <Link
            href="/orders"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/orders"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icons.billing className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </>
      )}
      {isManager && (
        <>
          <Link
            href="/reports"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/reports"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icons.post className="mr-2 h-4 w-4" />
            Reports
          </Link>
          <Link
            href="/reports/whatsapp"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/reports/whatsapp"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start pl-8"
            )}
          >
            WhatsApp Analytics
          </Link>
          <Link
            href="/reports/revenue"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/reports/revenue"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start pl-8"
            )}
          >
            Revenue
          </Link>
        </>
      )}
      {isAdmin && (
        <>
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/settings"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icons.settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/settings/users"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/settings/users"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start pl-8"
            )}
          >
            Users
          </Link>
          <Link
            href="/settings/products"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/settings/products"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start pl-8"
            )}
          >
            Products
          </Link>
          <Link
            href="/settings/integrations"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === "/settings/integrations"
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start pl-8"
            )}
          >
            Integrations
          </Link>
        </>
      )}
    </nav>
  )
}
