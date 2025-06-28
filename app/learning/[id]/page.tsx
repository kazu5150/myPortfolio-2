"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar, BarChart3, Edit3, Trash2, Loader2, Tag, Clock, Trophy, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { LearningEntry, LearningResource } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LearningForm } from "@/components/LearningForm"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function LearningDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entry, setEntry] = useState<LearningEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchEntry(params.id as string)
    }
  }, [params.id])

  const fetchEntry = async (id: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('learning_entries')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEntry(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    
    if (confirm('この学習項目を削除しますか？')) {
      try {
        const { error } = await supabase
          .from('learning_entries')
          .delete()
          .eq('id', entry.id)

        if (error) throw error
        
        toast.success("学習項目を削除しました")
        router.push('/learning')
      } catch (err) {
        toast.error("学習項目の削除に失敗しました")
      }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PLANNING": return "計画中"
      case "IN_PROGRESS": return "学習中"
      case "COMPLETED": return "完了"
      case "PAUSED": return "一時停止"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING": return "bg-yellow-600/20 text-yellow-400"
      case "IN_PROGRESS": return "bg-blue-600/20 text-blue-400"
      case "COMPLETED": return "bg-green-600/20 text-green-400"
      case "PAUSED": return "bg-gray-600/20 text-gray-400"
      default: return "bg-gray-600/20 text-gray-400"
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "BEGINNER": return "bg-green-600/20 text-green-400"
      case "INTERMEDIATE": return "bg-yellow-600/20 text-yellow-400"
      case "ADVANCED": return "bg-red-600/20 text-red-400"
      default: return "bg-gray-600/20 text-gray-400"
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "BEGINNER": return "初級"
      case "INTERMEDIATE": return "中級"
      case "ADVANCED": return "上級"
      default: return level
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
          <span>学習項目を読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p>学習項目が見つかりませんでした</p>
          <Button 
            onClick={() => router.push('/learning')} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            学習記録一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const resources = Array.isArray(entry.resources) ? entry.resources as LearningResource[] : []

  return (
    <div className="min-h-screen p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/learning')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            学習記録一覧に戻る
          </Button>
        </div>

        {/* Learning Entry Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyan-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-3">{entry.title}</h1>
                <div className="flex items-center gap-3">
                  <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.status)}`}>
                    {getStatusLabel(entry.status)}
                  </Badge>
                  <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(entry.difficulty_level)}`}>
                    {getDifficultyLabel(entry.difficulty_level)}
                  </Badge>
                </div>
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

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                学習進捗
              </span>
              <span className="text-cyan-400 font-medium">{entry.progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${entry.progress}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {entry.description && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">学習内容</h3>
              <p className="text-gray-300 leading-relaxed">{entry.description}</p>
            </div>
          )}

          {/* Categories */}
          {entry.categories && entry.categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                カテゴリ
              </h3>
              <div className="flex gap-2 flex-wrap">
                {entry.categories.map(cat => (
                  <span key={cat} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {entry.skills && entry.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                習得スキル
              </h3>
              <div className="flex gap-2 flex-wrap">
                {entry.skills.map(skill => (
                  <span key={skill} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                学習日
              </h4>
              <p className="text-white">{formatDate(entry.start_date)}</p>
            </div>
            {entry.completed_hours !== null && entry.completed_hours > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  学習時間
                </h4>
                <p className="text-white">{entry.completed_hours}時間</p>
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        {resources.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Target className="h-6 w-6" />
              学習リソース
            </h2>
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div key={index} className="border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-2">{resource.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                        {resource.completed && (
                          <span className="text-sm bg-green-600/20 text-green-400 px-2 py-1 rounded">
                            完了
                          </span>
                        )}
                      </div>
                    </div>
                    {resource.url && (
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
                      >
                        リンク →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">学習情報</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">カテゴリ</span>
              <span className="text-white">{entry.category}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">作成日時</span>
              <span className="text-white">{formatDate(entry.created_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">最終更新日時</span>
              <span className="text-white">{formatDate(entry.updated_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">学習項目ID</span>
              <span className="text-white font-mono text-sm">{entry.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>学習項目編集</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <LearningForm 
              entry={entry}
              onClose={() => {
                setIsEditDialogOpen(false)
                fetchEntry(entry.id)
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}