"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, LayoutDashboard, Mail, Code2, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Welcome page",
  },
  {
    name: "Blog",
    href: "/blog",
    icon: BookOpen,
    description: "Technical articles",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Analytics & Insights",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Mail,
    description: "",
  },
]

export default function Sidebar({ onCollapsedChange }: { onCollapsedChange?: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Save collapsed state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
    onCollapsedChange?.(isCollapsed)
    
    // Emit custom event for other components to listen
    window.dispatchEvent(new CustomEvent('sidebarCollapsed', { detail: isCollapsed }))
  }, [isCollapsed, onCollapsedChange])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-gray-800 flex flex-col z-40 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-gray-800 rounded-full items-center justify-center text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-cyan-400">
          <Code2 className="h-6 w-6" />
          {!isCollapsed && <span className="text-xl font-semibold">AI Portfolio</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-cyan-400/10 text-cyan-400"
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isCollapsed && "h-6 w-6")} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={cn("p-6 text-xs text-gray-500 space-y-2", isCollapsed && "p-4")}>
        <div className="flex items-center gap-1">
          <Code2 className="h-3 w-3" />
          {!isCollapsed && <span>Powered by AI</span>}
        </div>
        {!isCollapsed && <div>© 2024 Kazu Dev</div>}
      </div>
    </aside>
    </>
  )
}