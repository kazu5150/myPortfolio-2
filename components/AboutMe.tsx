'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { AboutMeEditor, type AboutMeData } from '@/components/AboutMeEditor'

export default function AboutMe() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  
  // About Meデータの状態管理
  const [aboutMeData, setAboutMeData] = useState<AboutMeData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aboutMeData')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved about me data:', e)
        }
      }
    }
    return {
      title: "About Me",
      subtitle: "AIとプログラミングの力で、学習を可視化し、成長を加速させる開発者",
      profileTitle: "Profile",
      profileParagraphs: [
        "現在、創業として Web 開発に取り組みながら、本業への転換を目指している開発者です。AI技術の急速な発展に魅力を感じ、ChatGPT や Claude などのツールを積極的に学習に活用しています。",
        "特に、学習プロセスの可視化と効率化に興味があり、自身の成長を数値化・グラフ化することで、より効果的な学習方法を模索しています。",
        "技術的な挑戦だけでなく、ビジネス価値の創出も重視し、実用的なアプリケーション開発を通じて実践的なスキルを身につけています。"
      ],
      skillsTitle: "Technical Skills",
      skills: [
        'JavaScript', 'Next.js', 'Python', 'Docker', 'Git/GitHub',
        'GAS', 'GCP', 'AWS', 'Supabase', 'Vercel',
        'Google Workspace', 'PostgreSQL', '各種API連携'
      ]
    }
  })

  // About Meデータの保存
  const handleAboutMeSave = (newData: AboutMeData) => {
    setAboutMeData(newData)
    localStorage.setItem('aboutMeData', JSON.stringify(newData))
  }
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 font-sans relative">
      <div className="max-w-6xl w-full">
        {/* Edit Button */}
        <div className="absolute top-8 right-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            className="bg-black/20 border-gray-600 text-gray-300 hover:bg-black/40 hover:text-white backdrop-blur-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            About Me編集
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-thin text-cyan-400 mb-6">
            {aboutMeData.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            {aboutMeData.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-6">{aboutMeData.profileTitle}</h3>
            <div className="space-y-4 text-gray-300">
              {aboutMeData.profileParagraphs.map((paragraph, index) => (
                <p key={index} dangerouslySetInnerHTML={{ 
                  __html: paragraph
                    .replace(/学習プロセスの可視化/g, '<span class="text-cyan-400">学習プロセスの可視化</span>')
                    .replace(/ビジネス価値の創出/g, '<span class="text-purple-400">ビジネス価値の創出</span>')
                }} />
              ))}
            </div>
          </motion.div>

          {/* Technical Skills Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 border border-gray-800"
          >
            <h3 className="text-2xl font-semibold text-cyan-400 mb-6">{aboutMeData.skillsTitle}</h3>
            <div className="flex flex-wrap gap-3">
              {aboutMeData.skills.filter(skill => skill.trim()).map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* About Me Editor */}
      <AboutMeEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        aboutMeData={aboutMeData}
        onSave={handleAboutMeSave}
      />
    </section>
  )
}