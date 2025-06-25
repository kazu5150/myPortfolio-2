import { useState, useEffect } from 'react'

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }

    // Listen for changes across tabs/windows and from the sidebar component
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent && e.key !== 'sidebarCollapsed') return
      
      const saved = localStorage.getItem('sidebarCollapsed')
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved))
      }
    }

    window.addEventListener('storage', handleStorageChange as EventListener)
    window.addEventListener('sidebarCollapsed', handleStorageChange as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener)
      window.removeEventListener('sidebarCollapsed', handleStorageChange as EventListener)
    }
  }, [])

  return isCollapsed
}