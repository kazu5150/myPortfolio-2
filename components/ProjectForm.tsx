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
import { useProjects } from "@/hooks/useProjects"
import { ProjectInsert, ProjectCategory, ProjectStatus } from "@/types/database"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const projectSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  category: z.enum(["WEB", "MOBILE", "AI", "GAME", "TOOL", "OTHER"]),
  status: z.enum(["PLANNING", "IN_PROGRESS", "TESTING", "COMPLETED", "PAUSED"]),
  progress: z.number().min(0).max(100),
  technologies: z.string(),
  start_date: z.string().optional(),
  demo_url: z.string().optional(),
  github_url: z.string().optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  onClose: () => void
  project?: ProjectInsert
}

export function ProjectForm({ onClose, project }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProject, updateProject } = useProjects()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: (project?.category as ProjectCategory) || "OTHER",
      status: (project?.status as ProjectStatus) || "PLANNING",
      progress: project?.progress || 0,
      technologies: project?.technologies?.join(", ") || "",
      start_date: project?.start_date || "",
      demo_url: project?.demo_url || "",
      github_url: project?.github_url || ""
    }
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true)
      
      const projectData: ProjectInsert = {
        ...data,
        technologies: data.technologies.split(",").map(t => t.trim()).filter(t => t),
        start_date: data.start_date || null,
        demo_url: data.demo_url || null,
        github_url: data.github_url || null
      }

      if (project?.id) {
        await updateProject(project.id, projectData)
        toast.success("プロジェクトを更新しました")
      } else {
        await createProject(projectData)
        toast.success("プロジェクトを作成しました")
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
      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="プロジェクトタイトル"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="プロジェクトの説明"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value as ProjectCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEB">WEB</SelectItem>
              <SelectItem value="MOBILE">MOBILE</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
              <SelectItem value="GAME">GAME</SelectItem>
              <SelectItem value="TOOL">TOOL</SelectItem>
              <SelectItem value="OTHER">OTHER</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>ステータス</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) => setValue("status", value as ProjectStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNING">計画中</SelectItem>
              <SelectItem value="IN_PROGRESS">開発中</SelectItem>
              <SelectItem value="TESTING">テスト中</SelectItem>
              <SelectItem value="COMPLETED">完成</SelectItem>
              <SelectItem value="PAUSED">一時停止</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="progress">進捗 ({watch("progress")}%)</Label>
        <Input
          id="progress"
          type="range"
          min="0"
          max="100"
          {...register("progress", { valueAsNumber: true })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">技術スタック</Label>
        <Input
          id="technologies"
          {...register("technologies")}
          placeholder="React, Next.js, TypeScript (カンマ区切り)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">開始日</Label>
        <Input
          id="start_date"
          type="date"
          {...register("start_date")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="demo_url">デモURL</Label>
          <Input
            id="demo_url"
            {...register("demo_url")}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            {...register("github_url")}
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {project ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  )
}