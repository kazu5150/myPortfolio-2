"use client"

import { useState } from "react"
import { Plus, FileText, Calendar, Clock, Eye, Trash2, Loader2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePosts } from "@/hooks/usePosts"
import { PostStatus } from "@/types/database"
import { PostForm } from "@/components/PostForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const statusFilters: { value: PostStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "すべて" },
  { value: "DRAFT", label: "下書き" },
  { value: "PUBLISHED", label: "公開済み" },
  { value: "ARCHIVED", label: "アーカイブ" }
]

export default function BlogPage() {
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const { posts, loading, error, deletePost, publishPost } = usePosts(true) // Include unpublished posts

  const filteredPosts = posts.filter(post => {
    return statusFilter === "ALL" || post.status === statusFilter
  })

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id)
      toast.success("記事を削除しました")
    } catch {
      toast.error("記事の削除に失敗しました")
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishPost(id)
      toast.success("記事を公開しました")
    } catch {
      toast.error("記事の公開に失敗しました")
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DRAFT": return "下書き"
      case "PUBLISHED": return "公開済み"
      case "ARCHIVED": return "アーカイブ"
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-yellow-600/20 text-yellow-400"
      case "PUBLISHED": return "bg-green-600/20 text-green-400"
      case "ARCHIVED": return "bg-gray-600/20 text-gray-400"
      default: return "bg-gray-600/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未設定"
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>記事を読み込み中...</span>
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
          Technical Blog
        </h1>
        <p className="text-gray-400 text-lg mb-12 max-w-3xl">
          技術的な知見や学習の記録をここにまとめています。新しい技術への挑戦や問題解決のプロセスを共有し、コミュニティとの知識交換を図ります。
        </p>

        {/* Controls */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-cyan-400">記事一覧</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-5 w-5 mr-2" />
                  新規記事
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>新規記事作成</DialogTitle>
                </DialogHeader>
                <PostForm onClose={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
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

        {/* Posts Grid */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-medium text-white hover:text-cyan-400 transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                    <Badge className={cn("text-xs", getStatusColor(post.status))}>
                      {getStatusLabel(post.status)}
                    </Badge>
                  </div>
                  
                  {post.excerpt && (
                    <p className="text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                  )}
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.status === 'PUBLISHED' && post.published_at
                          ? `公開: ${formatDate(post.published_at)}`
                          : `作成: ${formatDate(post.created_at)}`
                        }
                      </span>
                    </div>
                    {post.reading_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.reading_time}分</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center ml-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-800">
                <button className="px-4 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  読む
                </button>
                
                <Dialog open={editingPost?.id === post.id} onOpenChange={(open) => !open && setEditingPost(null)}>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => setEditingPost(post)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      編集
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>記事編集</DialogTitle>
                    </DialogHeader>
                    <PostForm 
                      post={editingPost} 
                      onClose={() => setEditingPost(null)} 
                    />
                  </DialogContent>
                </Dialog>
                
                {post.status === 'DRAFT' && (
                  <button 
                    onClick={() => handlePublish(post.id)}
                    className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    公開
                  </button>
                )}
                
                <button 
                  onClick={() => handleDelete(post.id)}
                  className="ml-auto p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">記事がありません</p>
            <p className="text-gray-500 text-sm">新しい記事を作成してください</p>
          </div>
        )}
      </div>
    </div>
  )
}