"use client"

import dynamic from "next/dynamic"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { Github, Linkedin, Mail, ChevronDown, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebarState } from "@/hooks/useSidebarState"
import { ProfileEditor, type ProfileData } from "@/components/ProfileEditor"
import { Button } from "@/components/ui/button"
import ElevenLabsWidget from "@/components/elevenlabs-widget"

const Globe = dynamic<{ onColorChange?: (color: { from: string; to: string }) => void }>(
  () => import("@/components/Globe"), 
  { ssr: false }
)
const AboutMe = dynamic(() => import("@/components/AboutMe"), { ssr: false })

export default function Home() {
  const isCollapsed = useSidebarState()
  const [currentColor, setCurrentColor] = useState({ from: "#06b6d4", to: "#3b82f6" }) // cyan-400 to blue-500
  const [targetColor, setTargetColor] = useState({ from: "#06b6d4", to: "#3b82f6" })
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  // プロフィールデータの状態管理
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('profileData')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved profile data:', e)
        }
      }
    }
    return {
      name: "Matsuzawa",
      title: ", the AI software engineer",
      subtitle: "1%の挑戦。 99%失敗する。\nも1%の可能性に賭けて挑戦し続けるのだ！\nAIとテクノロジーで未来を築こう!",
      ctaText: "Start exploring",
      ctaLink: "/blog"
    }
  })
  
  // Smooth color transition using useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor(prev => {
        const lerpColor = (start: string, end: string, t: number) => {
          const startRGB = parseInt(start.slice(1), 16)
          const endRGB = parseInt(end.slice(1), 16)
          
          const r1 = (startRGB >> 16) & 0xff
          const g1 = (startRGB >> 8) & 0xff
          const b1 = startRGB & 0xff
          
          const r2 = (endRGB >> 16) & 0xff
          const g2 = (endRGB >> 8) & 0xff
          const b2 = endRGB & 0xff
          
          const r = Math.round(r1 + (r2 - r1) * t)
          const g = Math.round(g1 + (g2 - g1) * t)
          const b = Math.round(b1 + (b2 - b1) * t)
          
          return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
        }
        
        const newFrom = lerpColor(prev.from, targetColor.from, 0.05)
        const newTo = lerpColor(prev.to, targetColor.to, 0.05)
        
        return { from: newFrom, to: newTo }
      })
    }, 16) // 60fps
    
    return () => clearInterval(interval)
  }, [targetColor])

  // プロフィールデータの保存
  const handleProfileSave = (newData: ProfileData) => {
    setProfileData(newData)
    localStorage.setItem('profileData', JSON.stringify(newData))
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden flex items-center">
      {/* Background Globe - centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-60 lg:opacity-70">
        <Suspense fallback={<div />}>
          <Globe onColorChange={setTargetColor} />
        </Suspense>
      </div>

      {/* Main Content - positioned to the left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="space-y-8 max-w-3xl">
          {/* Edit Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(true)}
              className="bg-black/20 border-gray-600 text-gray-300 hover:bg-black/40 hover:text-white backdrop-blur-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              プロフィール編集
            </Button>
          </div>

          {/* Hero Text */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-thin leading-tight tracking-tight">
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent transition-all duration-1000 inline-block"
              style={{
                backgroundImage: `linear-gradient(90deg, ${currentColor.from} 0%, ${currentColor.to} 50%, ${currentColor.from} 100%)`,
                backgroundSize: '200% 100%',
                backgroundPosition: '0% 50%'
              }}
            >
              {profileData.name}
            </span>
            <span className="text-white">{profileData.title}</span>
          </h1>

          {/* Japanese Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light whitespace-pre-line">
            {profileData.subtitle}
          </p>

          {/* CTA Button */}
          <div className="pt-8">
            <Link
              href={profileData.ctaLink}
              className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-base md:text-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25"
            >
              {profileData.ctaText}
            </Link>
          </div>
        </div>

        {/* Social Links */}
        <div className={cn(
          "fixed bottom-8 flex items-center gap-4 lg:gap-6 z-20 transition-all duration-300",
          "left-6",
          isCollapsed ? "lg:left-24" : "lg:left-[304px]"
        )}>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 lg:w-12 lg:h-12 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 lg:w-12 lg:h-12 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
          <Link
            href="mailto:contact@example.com"
            className="w-10 h-10 lg:w-12 lg:h-12 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </div>
      </div>
      </div>

      {/* About Me Section */}
      <AboutMe />

      {/* ElevenLabs Widget - Homepage only */}
      <ElevenLabsWidget />

      {/* Profile Editor */}
      <ProfileEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        profileData={profileData}
        onSave={handleProfileSave}
      />
    </div>
  )
}
