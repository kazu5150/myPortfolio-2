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
import { Loader2 } from "lucide-react"

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

export function PostForm({ onClose, post }: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const title = watch("title")
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
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

      <div className="space-y-2">
        <Label htmlFor="content">本文</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="マークダウン形式で記事を書いてください"
          rows={15}
          className="font-mono text-sm"
        />
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
  )
}