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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageUpload } from "@/components/ImageUpload"
import { useProjects } from "@/hooks/useProjects"
import { ProjectInsert, ProjectCategory, ProjectStatus } from "@/types/database"
import { toast } from "sonner"
import { Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"

const projectSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  detailed_content: z.string().optional(),
  next_steps: z.string().optional(),
  work_in_progress_url: z.string().optional(),
  image_url: z.string().optional(),
  category: z.enum(["WEB", "MOBILE", "AI", "GAME", "TOOL", "OTHER"]),
  status: z.enum(["PLANNING", "IN_PROGRESS", "TESTING", "COMPLETED", "PAUSED"]),
  progress: z.number().min(0).max(100),
  technologies: z.string(),
  start_date: z.date().optional(),
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
      detailed_content: project?.detailed_content || "",
      next_steps: project?.next_steps || "",
      work_in_progress_url: project?.work_in_progress_url || "",
      image_url: project?.image_url || "",
      category: (project?.category as ProjectCategory) || "OTHER",
      status: (project?.status as ProjectStatus) || "PLANNING",
      progress: project?.progress || 0,
      technologies: project?.technologies?.join(", ") || "",
      start_date: project?.start_date ? new Date(project.start_date) : undefined,
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
        start_date: data.start_date?.toISOString().split('T')[0] || null,
        demo_url: data.demo_url || null,
        github_url: data.github_url || null,
        detailed_content: data.detailed_content || null,
        next_steps: data.next_steps || null,
        work_in_progress_url: data.work_in_progress_url || null,
        image_url: data.image_url || null
      }

      console.log("Submitting project data:", projectData)
      console.log("Project ID:", project?.id)
      console.log("Is editing:", !!project?.id)

      if (project?.id) {
        const result = await updateProject(project.id, projectData)
        console.log("Update result:", result)
        toast.success("プロジェクトを更新しました")
      } else {
        const result = await createProject(projectData)
        console.log("Create result:", result)
        toast.success("プロジェクトを作成しました")
      }
      
      onClose()
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(`操作に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        <Label htmlFor="description">概要</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="プロジェクトの概要（簡潔な説明）"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailed_content">詳細内容</Label>
        <Textarea
          id="detailed_content"
          {...register("detailed_content")}
          placeholder="プロジェクトの詳細な内容、技術的な説明、課題と解決策など..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_steps">ネクストステップ</Label>
        <Textarea
          id="next_steps"
          {...register("next_steps")}
          placeholder="今後の予定、改善点、追加したい機能など..."
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
        <Label>開始日</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-900 border-gray-800 text-gray-100",
                !watch("start_date") && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {watch("start_date") ? (
                format(watch("start_date")!, "yyyy年MM月dd日", { locale: ja })
              ) : (
                <span>日付を選択</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800">
            <Calendar
              mode="single"
              selected={watch("start_date")}
              onSelect={(date) => setValue("start_date", date)}
              initialFocus
              locale={ja}
              className="bg-gray-900 text-gray-100"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>プロジェクト画像</Label>
          <ImageUpload
            value={watch("image_url") || ""}
            onChange={(url) => setValue("image_url", url || "")}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="work_in_progress_url">作成中プロジェクトのリンク</Label>
          <Input
            id="work_in_progress_url"
            {...register("work_in_progress_url")}
            placeholder="https://... (開発中のアプリやプロトタイプのURL)"
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