"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAdmin: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// 管理者パスワード（実際の運用では環境変数から取得）
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ページロード時にローカルストレージからログイン状態を復元
    const checkAuthStatus = () => {
      const adminStatus = localStorage.getItem('isAdmin')
      const loginTime = localStorage.getItem('adminLoginTime')
      
      if (adminStatus === 'true' && loginTime) {
        const currentTime = Date.now()
        const storedTime = parseInt(loginTime)
        // 24時間でセッション期限切れ
        const SESSION_DURATION = 24 * 60 * 60 * 1000
        
        if (currentTime - storedTime < SESSION_DURATION) {
          setIsAdmin(true)
        } else {
          // セッション期限切れの場合、ローカルストレージをクリア
          localStorage.removeItem('isAdmin')
          localStorage.removeItem('adminLoginTime')
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = async (password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminLoginTime', Date.now().toString())
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminLoginTime')
  }

  const value = {
    isAdmin,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}