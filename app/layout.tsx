"use client"

import './globals.css'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatbotWrapper } from '@/components/chatbot-wrapper'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isCollapsed, setIsCollapsed] = useState(true)  // デフォルトをtrueに変更

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    } else {
      // 初回訪問時はデフォルトで折りたたまれた状態にする
      setIsCollapsed(true)
    }
  }, [])

  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-white">
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
      </body>
    </html>
  )
}
