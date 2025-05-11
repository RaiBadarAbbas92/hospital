"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Calendar, FileText, Home, Pill, TestTube, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Patients",
    href: "/dashboard/patients",
    icon: UserPlus,
  },
  {
    title: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Medicine",
    href: "/dashboard/medicine",
    icon: Pill,
  },
  {
    title: "Laboratory",
    href: "/dashboard/lab",
    icon: TestTube,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: FileText,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: Activity,
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
  }, [isCollapsed])

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 border-r bg-background transition-all duration-300 md:flex md:flex-col",
        isCollapsed && "w-20"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Home className="h-6 w-6" />
          {!isCollapsed && <span>HMS</span>}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname.startsWith(item.href) && pathname !== "/dashboard" && "bg-secondary",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
              {!isCollapsed && item.title}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-5 w-5", !isCollapsed && "mr-2", isCollapsed && "rotate-180")}
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {!isCollapsed && "Collapse Sidebar"}
        </Button>
      </div>
    </aside>
  )
}
