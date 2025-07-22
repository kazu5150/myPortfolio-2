"use client"

import { useState } from "react"
import { Plus, FileText, Calendar, Clock, Eye, Loader2, Edit } from "lucide-react"
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
                <div className="mt-4">
                  <PostForm onClose={() => setIsCreateDialogOpen(false)} />
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
              {/* Featured Image */}
              {post.featured_image_url ? (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              )}

              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={cn("text-xs", getStatusColor(post.status))}>
                    {getStatusLabel(post.status)}
                  </Badge>
                </div>

                {/* Title */}
                <h2 className="text-lg font-medium text-white hover:text-cyan-400 transition-colors cursor-pointer mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-4">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Meta Info */}
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {post.status === 'PUBLISHED' && post.published_at
                        ? formatDate(post.published_at)
                        : formatDate(post.created_at)
                      }
                    </span>
                  </div>
                  {post.reading_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.reading_time}分</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="space-y-2">
                  <a 
                    href={`/blog/${post.slug}`}
                    className="w-full px-3 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="h-3 w-3" />
                    読む
                  </a>
                  
                  <div className="flex gap-2">
                    <Dialog open={editingPost?.id === post.id} onOpenChange={(open) => !open && setEditingPost(null)}>
                      <DialogTrigger asChild>
                        <button 
                          onClick={() => setEditingPost(post)}
                          className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-1 text-sm"
                        >
                          <Edit className="h-3 w-3" />
                          編集
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>記事編集</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <PostForm 
                            post={editingPost} 
                            onClose={() => setEditingPost(null)} 
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {post.status === 'DRAFT' ? (
                      <button 
                        onClick={() => handlePublish(post.id)}
                        className="flex-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
                      >
                        公開
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
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