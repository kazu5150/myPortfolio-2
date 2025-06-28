"use client"

import { useState } from "react"
import { Plus, BookOpen, Clock, Trophy, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLearningEntries } from "@/hooks/useLearning"
import { LearningCategory, LearningStatus, DifficultyLevel } from "@/types/database"
import { LearningForm } from "@/components/LearningForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const categoryFilters: { value: LearningCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "FRONTEND", label: "フロントエンド" },
  { value: "BACKEND", label: "バックエンド" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA", label: "データ" },
  { value: "AI", label: "AI" },
  { value: "DESIGN", label: "デザイン" },
  { value: "OTHER", label: "その他" }
]

const statusFilters: { value: LearningStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "PLANNING", label: "計画中" },
  { value: "IN_PROGRESS", label: "学習中" },
  { value: "COMPLETED", label: "完了" },
  { value: "PAUSED", label: "一時停止" }
]

export default function LearningPage() {
  const [categoryFilter, setCategoryFilter] = useState<LearningCategory | "ALL">("ALL")
  const [statusFilter, setStatusFilter] = useState<LearningStatus | "ALL">("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { entries, loading, error, deleteEntry } = useLearningEntries()

  const filteredEntries = entries.filter(entry => {
    const categoryMatch = categoryFilter === "ALL" || entry.category === categoryFilter
    const statusMatch = statusFilter === "ALL" || entry.status === statusFilter
    return categoryMatch && statusMatch
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id)
      toast.success("学習エントリを削除しました")
    } catch {
      toast.error("学習エントリの削除に失敗しました")
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
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>学習データを読み込み中...</span>
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
          Learning Journey
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-3xl">
          継続的な学習と成長の記録。新しい技術やスキルの習得過程を追跡し、知識の体系化を図っています。
        </p>

        {/* Filters */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-cyan-400">学習記録</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-5 w-5 mr-2" />
                  新規学習項目
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>新規学習項目作成</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <LearningForm onClose={() => setIsCreateDialogOpen(false)} />
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

        {/* Learning Entries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{entry.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(entry.status)}
                      </Badge>
                      <Badge className={cn("text-xs", getDifficultyColor(entry.difficulty_level))}>
                        {getDifficultyLabel(entry.difficulty_level)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{entry.description}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">進捗</span>
                  <span className="text-cyan-400">{entry.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              </div>

              {/* Categories and Skills */}
              <div className="space-y-2 mb-4">
                {entry.categories && entry.categories.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {entry.categories.map(cat => (
                      <span key={cat} className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                {entry.skills && entry.skills.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {entry.skills.map(skill => (
                      <span key={skill} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="text-sm text-gray-500 mb-4">
                <span>📅 学習日: {formatDate(entry.start_date)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a 
                  href={`/learning/${entry.id}`}
                  className="px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
                >
                  詳細を見る
                </a>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  className="ml-auto p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">学習項目がありません</p>
            <p className="text-gray-500 text-sm">新しい学習項目を追加してください</p>
          </div>
        )}
      </div>
    </div>
  )
}