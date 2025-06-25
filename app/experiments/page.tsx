"use client"

import { useState } from "react"
import { Plus, Code2, ExternalLink, Trash2, Github as GithubIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Project types
type ProjectCategory = "ALL" | "WEB" | "MOBILE" | "AI" | "GAME" | "TOOL" | "OTHER"
type ProjectStatus = "ALL" | "PLANNING" | "IN_PROGRESS" | "TESTING" | "COMPLETED" | "PAUSED"

interface Project {
  id: string
  title: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  progress: number
  technologies: string[]
  startDate: string
  updateDate: string
  links: {
    demo?: string
    github?: string
  }
}

// Mock data
const mockProjects: Project[] = [
  {
    id: "1",
    title: "WMS 倉庫管理システム",
    description: "WMS作ってみた",
    category: "WEB",
    status: "IN_PROGRESS",
    progress: 40,
    technologies: ["Next.js", "supabase", "Vercel"],
    startDate: "2025/6/14",
    updateDate: "2025/6/23",
    links: {
      demo: "#",
      github: "#"
    }
  },
  {
    id: "2",
    title: "Eleven Labs 音声チャットボット",
    description: "Eleven Labs & OpenAI APIによるウェブアプリの作成公開",
    category: "AI",
    status: "COMPLETED",
    progress: 0,
    technologies: ["Next.js", "OpenAI API", "Eleven Labs API", "Vercel"],
    startDate: "2025/6/19",
    updateDate: "2025/6/22",
    links: {
      demo: "#",
      github: "#"
    }
  }
]

const categoryFilters: { value: ProjectCategory; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "WEB", label: "WEB" },
  { value: "MOBILE", label: "MOBILE" },
  { value: "AI", label: "AI" },
  { value: "GAME", label: "GAME" },
  { value: "TOOL", label: "TOOL" },
  { value: "OTHER", label: "OTHER" }
]

const statusFilters: { value: ProjectStatus; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "PLANNING", label: "計画中" },
  { value: "IN_PROGRESS", label: "開発中" },
  { value: "TESTING", label: "テスト中" },
  { value: "COMPLETED", label: "完成" },
  { value: "PAUSED", label: "一時停止" }
]

export default function ExperimentsPage() {
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory>("ALL")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("ALL")

  const filteredProjects = mockProjects.filter(project => {
    const categoryMatch = categoryFilter === "ALL" || project.category === categoryFilter
    const statusMatch = statusFilter === "ALL" || project.status === statusFilter
    return categoryMatch && statusMatch
  })

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case "IN_PROGRESS": return "開発中"
      case "COMPLETED": return "完成"
      default: return status
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl lg:text-6xl font-light text-cyan-400 mb-4">
          Experimental Projects
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-3xl">
          学習中の実験的なプロジェクトやプロトタイプを公開しています。新しい技術の探求と創造的なアイデアの実現に挑戦中。
        </p>

        {/* Filters */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-cyan-400">プロジェクト一覧</h2>
            <button className="ml-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新規プロジェクト
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-400">カテゴリ:</span>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm transition-colors",
                    categoryFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-400">ステータス:</span>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm transition-colors",
                    statusFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{project.title}</h3>
                    <span className="text-sm text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{project.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">進捗</span>
                  <span className="text-cyan-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Technologies */}
              <div className="flex gap-2 flex-wrap mb-4">
                {project.technologies.map(tech => (
                  <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Dates */}
              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span>📅 開始: {project.startDate}</span>
                <span>🔄 更新: {project.updateDate}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center gap-2">
                  <GithubIcon className="h-4 w-4" />
                  コード
                </button>
                <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  デモ
                </button>
                <button className="px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors">
                  詳細を見る
                </button>
                <button className="ml-auto p-2 text-gray-500 hover:text-gray-300 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}