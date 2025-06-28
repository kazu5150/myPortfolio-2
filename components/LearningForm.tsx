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
import { useLearningEntries } from "@/hooks/useLearning"
import { LearningEntryInsert, LearningCategory, LearningStatus, DifficultyLevel } from "@/types/database"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const learningSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  category: z.enum(["FRONTEND", "BACKEND", "DEVOPS", "DATA", "AI", "DESIGN", "OTHER"]),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "PAUSED"]),
  progress: z.number().min(0).max(100),
  skills: z.string(),
  difficulty_level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimated_hours: z.number().optional(),
  completed_hours: z.number().min(0),
  start_date: z.string().optional(),
  target_completion_date: z.string().optional()
})

type LearningFormData = z.infer<typeof learningSchema>

interface LearningFormProps {
  onClose: () => void
  entry?: LearningEntryInsert
}

export function LearningForm({ onClose, entry }: LearningFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createEntry, updateEntry } = useLearningEntries()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LearningFormData>({
    resolver: zodResolver(learningSchema),
    defaultValues: {
      title: entry?.title || "",
      description: entry?.description || "",
      category: (entry?.category as LearningCategory) || "OTHER",
      status: (entry?.status as LearningStatus) || "PLANNING",
      progress: entry?.progress || 0,
      skills: entry?.skills?.join(", ") || "",
      difficulty_level: (entry?.difficulty_level as DifficultyLevel) || "BEGINNER",
      estimated_hours: entry?.estimated_hours || undefined,
      completed_hours: entry?.completed_hours || 0,
      start_date: entry?.start_date || "",
      target_completion_date: entry?.target_completion_date || ""
    }
  })

  const onSubmit = async (data: LearningFormData) => {
    try {
      setIsSubmitting(true)
      
      const entryData: LearningEntryInsert = {
        ...data,
        skills: data.skills.split(",").map(s => s.trim()).filter(s => s),
        estimated_hours: data.estimated_hours || null,
        start_date: data.start_date || null,
        target_completion_date: data.target_completion_date || null,
        resources: []
      }

      if (entry?.id) {
        await updateEntry(entry.id, entryData)
        toast.success("学習項目を更新しました")
      } else {
        await createEntry(entryData)
        toast.success("学習項目を作成しました")
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
          placeholder="学習項目のタイトル"
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
          placeholder="学習内容の説明"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>カテゴリ</Label>
          <Select
            value={watch("category")}
            onValueChange={(value) => setValue("category", value as LearningCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FRONTEND">フロントエンド</SelectItem>
              <SelectItem value="BACKEND">バックエンド</SelectItem>
              <SelectItem value="DEVOPS">DevOps</SelectItem>
              <SelectItem value="DATA">データ</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
              <SelectItem value="DESIGN">デザイン</SelectItem>
              <SelectItem value="OTHER">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>ステータス</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) => setValue("status", value as LearningStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANNING">計画中</SelectItem>
              <SelectItem value="IN_PROGRESS">学習中</SelectItem>
              <SelectItem value="COMPLETED">完了</SelectItem>
              <SelectItem value="PAUSED">一時停止</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>難易度</Label>
        <Select
          value={watch("difficulty_level")}
          onValueChange={(value) => setValue("difficulty_level", value as DifficultyLevel)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BEGINNER">初級</SelectItem>
            <SelectItem value="INTERMEDIATE">中級</SelectItem>
            <SelectItem value="ADVANCED">上級</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="skills">スキル・技術</Label>
        <Input
          id="skills"
          {...register("skills")}
          placeholder="React, TypeScript, Node.js (カンマ区切り)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimated_hours">予定時間 (時間)</Label>
          <Input
            id="estimated_hours"
            type="number"
            min="0"
            {...register("estimated_hours", { valueAsNumber: true })}
            placeholder="40"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="completed_hours">完了時間 (時間)</Label>
          <Input
            id="completed_hours"
            type="number"
            min="0"
            {...register("completed_hours", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">開始日</Label>
          <Input
            id="start_date"
            type="date"
            {...register("start_date")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_completion_date">目標完了日</Label>
          <Input
            id="target_completion_date"
            type="date"
            {...register("target_completion_date")}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {entry ? "更新" : "作成"}
        </Button>
      </div>
    </form>
  )
}