'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export function N8NChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/n8n-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: inputValue
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      // n8nからの応答を適切に処理
      let responseText = ''
      if (data.response && typeof data.response === 'object' && data.response.output) {
        responseText = data.response.output
      } else if (typeof data.response === 'string') {
        responseText = data.response
      } else {
        responseText = JSON.stringify(data.response)
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error instanceof Error ? error.message : 'エラーが発生しました',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-black/80 backdrop-blur-sm border-blue-500/30 shadow-2xl shadow-blue-500/20">
      <CardHeader className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-blue-500/30">
        <CardTitle className="flex items-center gap-2 text-yellow-300">
          <Bot className="w-5 h-5 text-blue-400" />
          スター・ウォーズ AI チャット
        </CardTitle>
        <p className="text-sm text-blue-200">
          スター・ウォーズについて何でも聞いてください！
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4 bg-black/20">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-blue-200 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50 text-blue-400" />
                <p>スター・ウォーズについて質問してください</p>
                <p className="text-xs text-blue-300 mt-2">フォースと共にあらんことを...</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-blue-600 text-white border-2 border-blue-400' 
                      : 'bg-gray-800 text-yellow-300 border-2 border-yellow-500/50'
                  }`}>
                    {message.isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div
                    className={`rounded-lg p-3 backdrop-blur-sm ${
                      message.isUser
                        ? 'bg-blue-600/80 text-white border border-blue-400/50'
                        : 'bg-gray-800/80 text-gray-100 border border-yellow-500/30'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.isUser ? 'text-blue-200' : 'text-yellow-200'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-yellow-300 border-2 border-yellow-500/50">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-gray-800/80 text-gray-100 border border-yellow-500/30 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-black/30 rounded-lg border border-blue-500/30">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="スター・ウォーズについて質問してください..."
            disabled={isLoading}
            className="flex-1 bg-black/50 border-blue-500/50 text-white placeholder-blue-200 focus:border-yellow-500/50"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border border-blue-400/50 text-white shadow-lg shadow-blue-500/25"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}