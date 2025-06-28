"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Code2, ExternalLink, Github as GithubIcon, Loader2, Calendar, Tag, BarChart3, Edit3, Trash2, Target, Hammer } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Project } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectForm } from "@/components/ProjectForm"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string)
    }
  }, [params.id])

  const fetchProject = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return
    
    if (confirm('このプロジェクトを削除しますか？')) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id)

        if (error) throw error
        
        toast.success("プロジェクトを削除しました")
        router.push('/experiments')
      } catch (err) {
        toast.error("プロジェクトの削除に失敗しました")
      }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING": return "bg-yellow-600/20 text-yellow-400"
      case "IN_PROGRESS": return "bg-blue-600/20 text-blue-400"
      case "TESTING": return "bg-orange-600/20 text-orange-400"
      case "COMPLETED": return "bg-green-600/20 text-green-400"
      case "PAUSED": return "bg-gray-600/20 text-gray-400"
      default: return "bg-gray-600/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (error || !project) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p>プロジェクトが見つかりませんでした</p>
          <Button 
            onClick={() => router.push('/experiments')} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            プロジェクト一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/experiments')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            プロジェクト一覧に戻る
          </Button>
        </div>

        {/* Project Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {project.image_url ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-600 shadow-md bg-gray-700 flex items-center justify-center">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code2 className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                編集
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="border-red-700 text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </div>
          </div>

          {/* Large Project Image */}
          {project.image_url && (
            <div className="mb-6">
              <div 
                className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 shadow-xl bg-gray-800 flex items-center justify-center cursor-pointer group/image relative"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="max-w-full max-h-full object-contain group-hover/image:scale-105 transition-transform duration-300"
                />
                {/* Overlay hint */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    クリックで拡大
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                進捗状況
              </span>
              <span className="text-cyan-400 font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">プロジェクト概要</h3>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Detailed Content */}
          {project.detailed_content && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">詳細内容</h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {project.detailed_content}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {project.next_steps && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                ネクストステップ
              </h3>
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                <div className="text-blue-200 leading-relaxed whitespace-pre-wrap">
                  {project.next_steps}
                </div>
              </div>
            </div>
          )}

          {/* Technologies */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              使用技術
            </h3>
            <div className="flex gap-2 flex-wrap">
              {project.technologies.map(tech => (
                <span key={tech} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                開始日
              </h4>
              <p className="text-white">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                最終更新
              </h4>
              <p className="text-white">{formatDate(project.update_date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">カテゴリ</h4>
              <p className="text-white">{project.category}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-800 flex-wrap">
            {project.work_in_progress_url && project.work_in_progress_url !== "#" && (
              <a 
                href={project.work_in_progress_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors flex items-center gap-2 font-medium"
              >
                <Hammer className="h-5 w-5" />
                作成中を見る
              </a>
            )}
            {project.github_url && project.github_url !== "#" && (
              <a 
                href={project.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center gap-2 font-medium"
              >
                <GithubIcon className="h-5 w-5" />
                ソースコード
              </a>
            )}
            {project.demo_url && project.demo_url !== "#" && (
              <a 
                href={project.demo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors flex items-center gap-2 font-medium"
              >
                <ExternalLink className="h-5 w-5" />
                ライブデモ
              </a>
            )}
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">プロジェクト情報</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">作成日時</span>
              <span className="text-white">{formatDate(project.created_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">最終更新日時</span>
              <span className="text-white">{formatDate(project.updated_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">プロジェクトID</span>
              <span className="text-white font-mono text-sm">{project.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>プロジェクト編集</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ProjectForm 
              project={project}
              onClose={() => {
                setIsEditDialogOpen(false)
                fetchProject(project.id)
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-black/90 border-0">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={project?.image_url || ''} 
              alt={project?.title || ''}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}