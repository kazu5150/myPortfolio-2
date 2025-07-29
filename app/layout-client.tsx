"use client"

import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatbotWrapper } from '@/components/chatbot-wrapper'

export default function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    } else {
      setIsCollapsed(true)
    }
  }, [])

  return (
    <AuthProvider>
      <Sidebar onCollapsedChange={setIsCollapsed} />
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
      )}>
        {children}
      </main>
      <ChatbotWrapper />
    </AuthProvider>
  )
}