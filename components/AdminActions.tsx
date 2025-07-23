"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AdminLogin } from '@/components/AdminLogin'
import { toast } from 'sonner'

export function AdminActions() {
  const { isAdmin, logout, loading } = useAuth()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('ログアウトしました')
  }

  if (loading) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <User className="h-3 w-3" />
            管理者
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-1" />
            ログアウト
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLoginDialog(true)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Lock className="h-4 w-4 mr-1" />
          管理者ログイン
        </Button>
      )}

      <AdminLogin
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  )
}