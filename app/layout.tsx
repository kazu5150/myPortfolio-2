"use client"

import './globals.css'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-white">
        <Sidebar onCollapsedChange={setIsCollapsed} />
        <main className={cn(
          "min-h-screen transition-all duration-300",
          isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
        )}>
          {children}
        </main>
      </body>
    </html>
  )
}
