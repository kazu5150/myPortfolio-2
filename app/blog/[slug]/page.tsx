"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Clock, Edit3, Trash2, Loader2, Tag, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Post } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PostForm } from "@/components/PostForm"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      setPost(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return
    
    if (confirm('この記事を削除しますか？')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id)

        if (error) throw error
        
        toast.success("記事を削除しました")
        router.push('/blog')
      } catch (err) {
        toast.error("記事の削除に失敗しました")
      }
    }
  }

  const handlePublish = async () => {
    if (!post) return
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: 'PUBLISHED',
          published_at: new Date().toISOString()
        })
        .eq('id', post.id)

      if (error) throw error
      
      toast.success("記事を公開しました")
      fetchPost(post.slug)
    } catch (err) {
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (error || !post) {
    return (
      <div className="min-h-screen p-6 lg:p-12 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p>記事が見つかりませんでした</p>
          <Button 
            onClick={() => router.push('/blog')} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            ブログ一覧に戻る
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
            onClick={() => router.push('/blog')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            ブログ一覧に戻る
          </Button>
        </div>

        {/* Article Header */}
        <article className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
                  {getStatusLabel(post.status)}
                </Badge>
                {post.reading_time && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time}分で読めます</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center ml-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Article Meta */}
          <div className="flex items-center gap-6 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {post.status === 'PUBLISHED' && post.published_at
                  ? `公開日: ${formatDate(post.published_at)}`
                  : `作成日: ${formatDate(post.created_at)}`
                }
              </span>
            </div>
            {post.updated_at !== post.created_at && (
              <div className="flex items-center gap-2">
                <span>最終更新: {formatDate(post.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                タグ
              </h3>
              <div className="flex gap-2 flex-wrap">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Article Content */}
          {post.content && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">記事内容</h3>
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-800">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(true)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              編集
            </Button>
            
            {post.status === 'DRAFT' && (
              <Button 
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700"
              >
                公開する
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="border-red-700 text-red-400 hover:bg-red-900/20 ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </Button>
          </div>
        </article>

        {/* Article Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">記事情報</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">スラッグ</span>
              <span className="text-white font-mono text-sm">{post.slug}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">ステータス</span>
              <Badge className={`${getStatusColor(post.status)}`}>
                {getStatusLabel(post.status)}
              </Badge>
            </div>
            {post.featured_image_url && (
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-gray-400">アイキャッチ画像</span>
                <a 
                  href={post.featured_image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  画像を見る →
                </a>
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">作成日時</span>
              <span className="text-white">{formatDate(post.created_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-800">
              <span className="text-gray-400">最終更新日時</span>
              <span className="text-white">{formatDate(post.updated_at)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">記事ID</span>
              <span className="text-white font-mono text-sm">{post.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>記事編集</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <PostForm 
              post={post}
              onClose={() => {
                setIsEditDialogOpen(false)
                fetchPost(post.slug)
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}