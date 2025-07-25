'use client'

import { usePathname } from 'next/navigation'
import { Chatbot } from './chatbot'
import { useEffect, useState } from 'react'

export function ChatbotWrapper() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // クライアントサイドでのみレンダリング
  if (!mounted) {
    return null
  }
  
  // トップページ以外でChatbotを表示
  if (pathname === '/' || pathname === '') {
    return null
  }
  
  return <Chatbot />
}