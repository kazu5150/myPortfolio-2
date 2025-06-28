"use client"

import { useState } from "react"
import { Plus, Code2, ExternalLink, Trash2, Github as GithubIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProjects } from "@/hooks/useProjects"
import { ProjectCategory, ProjectStatus } from "@/types/database"
import { ProjectForm } from "@/components/ProjectForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

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
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { projects, loading, error, deleteProject } = useProjects()

  const filteredProjects = projects.filter(project => {
    const categoryMatch = categoryFilter === "ALL" || project.category === categoryFilter
    const statusMatch = statusFilter === "ALL" || project.status === statusFilter
    return categoryMatch && statusMatch
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      toast.success("プロジェクトを削除しました")
    } catch {
      toast.error("プロジェクトの削除に失敗しました")
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PLANNING": return "計画中"
      case "IN_PROGRESS": return "開発中"
      case "TESTING": return "テスト中"
      case "COMPLETED": return "完成"
      case "PAUSED": return "一時停止"
      default: return status
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>プロジェクトを読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p>エラーが発生しました: {error}</p>
        </div>
      </div>
    )
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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-5 w-5 mr-2" />
                  新規プロジェクト
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>新規プロジェクト作成</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <ProjectForm onClose={() => setIsCreateDialogOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-400">カテゴリ:</span>
            <div className="flex gap-2 flex-wrap">
              {categoryFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value as ProjectCategory | "ALL")}
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
                  onClick={() => setStatusFilter(filter.value as ProjectStatus | "ALL")}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 hover:shadow-lg transition-all duration-200 group relative"
            >
              {/* Project Title */}
              <div className="mb-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-600/30 rounded-lg p-3">
                <a 
                  href={`/experiments/${project.id}`}
                  className="block"
                >
                  <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                </a>
              </div>

              {/* Project Image */}
              {project.image_url ? (
                <a 
                  href={`/experiments/${project.id}`}
                  className="block mb-4"
                >
                  <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </a>
              ) : (
                <a 
                  href={`/experiments/${project.id}`}
                  className="block mb-4"
                >
                  <div className="w-full h-40 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-600/30 hover:bg-blue-600/30 transition-colors">
                    <Code2 className="h-10 w-10 text-blue-400" />
                  </div>
                </a>
              )}
              
              {/* Project Info */}
              <div className="space-y-3">
                
                <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    {getStatusLabel(project.status)}
                  </span>
                  <span className="text-sm text-cyan-400 font-medium">
                    {project.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {/* Tech Tags */}
                <div className="flex gap-2 flex-wrap">
                  {project.technologies.slice(0, 3).map(tech => (
                    <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {project.demo_url && project.demo_url !== "#" && (
                    <a 
                      href={project.demo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 rounded-md hover:bg-cyan-600/30 transition-colors flex items-center gap-1 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      デモ
                    </a>
                  )}
                  {project.github_url && project.github_url !== "#" && (
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors flex items-center gap-1 text-sm"
                    >
                      <GithubIcon className="h-3 w-3" />
                      コード
                    </a>
                  )}
                  <a 
                    href={`/experiments/${project.id}`}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors text-sm ml-auto"
                  >
                    詳細
                  </a>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(project.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-400 bg-gray-900/80 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}