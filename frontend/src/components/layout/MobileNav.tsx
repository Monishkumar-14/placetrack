import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { LayoutDashboard, Building2, CalendarDays, BarChart3, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  onMenuClick: () => void
}

const mobileItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const location = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md pb-safe">
      <nav className="flex items-center justify-around h-16">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href))
            
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-[var(--muted-foreground)] transition-colors",
                isActive && "text-[var(--primary)]"
              )}
            >
              <div className="relative flex flex-col items-center">
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1">{item.name}</span>
                {isActive && (
                  <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-[var(--primary)]" />
                )}
              </div>
            </NavLink>
          )
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-1">More</span>
        </button>
      </nav>
    </div>
  )
}
