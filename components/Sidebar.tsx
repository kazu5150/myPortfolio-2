"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, GraduationCap, Beaker, BookOpen, LayoutDashboard, Mail, Code2, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    description: "Welcome page",
  },
  {
    name: "Learning Journey",
    href: "/learning",
    icon: GraduationCap,
    description: "Study progress & analytics",
  },
  {
    name: "Experiments",
    href: "/experiments",
    icon: Beaker,
    description: "Projects & prototypes",
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
    description: "Admin panel",
  },
  {
    name: "Contact",
    href: "/contact",
    icon: Mail,
    description: "",
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
        "fixed left-0 top-0 h-full w-[280px] bg-[#0a0a0a] border-r border-gray-800 flex flex-col z-40 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-cyan-400">
          <Code2 className="h-6 w-6" />
          <span className="text-xl font-semibold">AI Portfolio</span>
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
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 text-xs text-gray-500 space-y-2">
        <div className="flex items-center gap-1">
          <Code2 className="h-3 w-3" />
          <span>Powered by AI</span>
        </div>
        <div>© 2024 Kazu Dev</div>
      </div>
    </aside>
    </>
  )
}