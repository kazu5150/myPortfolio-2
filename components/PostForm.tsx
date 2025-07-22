"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { usePosts } from "@/hooks/usePosts"
import { PostInsert, PostStatus } from "@/types/database"
import { toast } from "sonner"
import { Loader2, Upload, X, Eye, Edit, Image as ImageIcon } from "lucide-react"

const postSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  slug: z.string().min(1, "スラッグは必須です").regex(/^[a-z0-9-]+$/, "スラッグは小文字、数字、ハイフンのみ使用可能です"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tags: z.string(),
  featured_image_url: z.string().optional(),
  reading_time: z.number().optional()
})

type PostFormData = z.infer<typeof postSchema>

interface PostFormProps {
  onClose: () => void
  post?: any
}

// Simple image upload component for this form
function ImageUploadModal({ onImageUploaded, onClose }: { onImageUploaded: (url: string) => void, onClose: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      
      // まずはローカルプレビュー用のblob URLを作成
      const blobUrl = URL.createObjectURL(file)
      
      // Supabase Storageアップロードを試行（オプション）
      try {
        const { supabase } = await import('@/lib/supabase')
        
        if (supabase) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `blog-images/${fileName}`

          const { data, error } = await supabase.storage
            .from('project-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (!error) {
            // 成功した場合はパブリックURLを使用
            const { data: { publicUrl } } = supabase.storage
              .from('project-images')
              .getPublicUrl(filePath)
            
            onImageUploaded(publicUrl)
            toast.success("画像をアップロードしました")
            onClose()
            return
          }
        }
      } catch (supabaseError) {
        console.log('Supabase upload failed, using local blob URL:', supabaseError)
      }
      
      // Supabaseが失敗またはない場合はローカルblob URLを使用
      onImageUploaded(blobUrl)
      toast.success("画像をアップロードしました (ローカル)")
      onClose()
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("画像のアップロードに失敗しました")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください")
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error("画像ファイルを選択してください")
      return
    }

    uploadImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (!imageFile) {
      toast.error("画像ファイルをドロップしてください")
      return
    }

    uploadImage(imageFile)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">画像をアップロード</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto" />
              <p className="text-gray-400">アップロード中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-gray-300 mb-2">画像をドラッグ&ドロップまたは</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="border-gray-600 text-gray-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  ファイルを選択
                </Button>
              </div>
              <p className="text-gray-500 text-sm">PNG, JPG, WebP, GIF (最大5MB)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function PostForm({ onClose, post }: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const { createPost, updatePost } = usePosts(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      status: (post?.status as PostStatus) || "DRAFT",
      tags: post?.tags?.join(", ") || "",
      featured_image_url: post?.featured_image_url || "",
      reading_time: post?.reading_time || undefined
    }
  })

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleImageUpload = (imageUrl: string) => {
    const currentContent = watch('content') || ''
    const imageMarkdown = `\n\n![画像](${imageUrl})\n\n`
    const newContent = currentContent + imageMarkdown
    setValue('content', newContent)
    setShowImageUpload(false)
    toast.success("画像をマークダウンに挿入しました")
  }

  const renderMarkdownPreview = (markdown: string) => {
    if (!markdown) return '<p class="text-gray-500">内容がありません</p>'
    
    // より安全なMarkdownパースと画像処理
    let html = markdown
      // 見出し
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-white">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 text-white">$1</h3>')
      // 強調
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      // 画像 - より確実な処理
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, (_, alt, src) => {
        // blob URLまたは通常のURLを処理
        return `<img src="${src}" alt="${alt}" class="max-w-full h-auto rounded-lg my-4 border border-gray-700 block" style="max-height: 400px; object-fit: contain;" onError="this.style.display='none'; this.parentNode.innerHTML='<div class=&quot;text-red-400 text-sm&quot;>画像を読み込めませんでした</div>'" />`
      })
      // リンク
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-cyan-400 hover:underline">$1</a>')
      // 段落
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph)
      .map(paragraph => `<p class="mb-4 text-gray-300">${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')
    
    return html
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      setIsSubmitting(true)
      
      const postData: PostInsert = {
        ...data,
        tags: data.tags.split(",").map(t => t.trim()).filter(t => t),
        featured_image_url: data.featured_image_url || null,
        reading_time: data.reading_time || null,
        published_at: data.status === 'PUBLISHED' ? new Date().toISOString() : null
      }

      if (post?.id) {
        await updatePost(post.id, postData)
        toast.success("記事を更新しました")
      } else {
        await createPost(postData)
        toast.success("記事を作成しました")
      }
      
      onClose()
    } catch (error) {
      toast.error("操作に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="記事のタイトル"
              onChange={(e) => {
                register("title").onChange(e)
                if (!post) {
                  setValue("slug", generateSlug(e.target.value))
                }
              }}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">スラッグ *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="article-slug"
            />
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">概要</Label>
          <Textarea
            id="excerpt"
            {...register("excerpt")}
            placeholder="記事の簡潔な説明"
            rows={3}
          />
        </div>

        {/* Content with Preview and Image Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">本文 (Markdown形式)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(true)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                画像挿入
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {isPreviewMode ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    編集
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    プレビュー
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {isPreviewMode ? (
            <div 
              className="min-h-[300px] p-4 bg-gray-900 border border-gray-700 rounded-md text-gray-300 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-4">${renderMarkdownPreview(watch('content') || '')}</p>` 
              }}
            />
          ) : (
            <Textarea
              id="content"
              {...register("content")}
              placeholder="マークダウン形式で記事を書いてください&#10;&#10;例:&#10;# 見出し1&#10;## 見出し2&#10;**太字** *斜体*&#10;![画像](画像URL)&#10;[リンク](URL)"
              rows={15}
              className="font-mono text-sm bg-gray-900 border-gray-700 text-white"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ステータス</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as PostStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">下書き</SelectItem>
                <SelectItem value="PUBLISHED">公開</SelectItem>
                <SelectItem value="ARCHIVED">アーカイブ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reading_time">読了時間 (分)</Label>
            <Input
              id="reading_time"
              type="number"
              min="1"
              {...register("reading_time", { valueAsNumber: true })}
              placeholder="5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">タグ</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="React, Next.js, TypeScript (カンマ区切り)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featured_image_url">アイキャッチ画像URL</Label>
          <Input
            id="featured_image_url"
            {...register("featured_image_url")}
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {post ? "更新" : "作成"}
          </Button>
        </div>
      </form>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          onImageUploaded={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  )
}