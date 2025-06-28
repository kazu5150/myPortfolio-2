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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLearningEntries } from "@/hooks/useLearning"
import { LearningEntryInsert, LearningStatus, DifficultyLevel } from "@/types/database"
import { toast } from "sonner"

const learningSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional(),
  categories: z.array(z.string()).min(1, "カテゴリーを少なくとも1つ選択してください"),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "PAUSED"]),
  progress: z.number().min(0).max(100),
  skills: z.string(),
  difficulty_level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  start_date: z.date(),
  study_hours: z.number().min(0.5).max(24)
})

const categoryOptions = [
  { value: "FRONTEND", label: "フロントエンド" },
  { value: "BACKEND", label: "バックエンド" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "DATA", label: "データ" },
  { value: "AI", label: "AI" },
  { value: "DESIGN", label: "デザイン" },
  { value: "MOBILE", label: "モバイル" },
  { value: "SECURITY", label: "セキュリティ" },
  { value: "CLOUD", label: "クラウド" },
  { value: "OTHER", label: "その他" }
]

type LearningFormData = z.infer<typeof learningSchema>

interface LearningFormProps {
  onClose: () => void
  entry?: LearningEntryInsert
}

export function LearningForm({ onClose, entry }: LearningFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | undefined>(entry?.start_date ? new Date(entry.start_date) : new Date())
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    entry?.categories || (entry?.category ? [entry.category] : [])
  )
  const [customCategory, setCustomCategory] = useState("")
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
      categories: entry?.category ? [entry.category] : [],
      status: (entry?.status as LearningStatus) || "IN_PROGRESS",
      progress: entry?.progress || 0,
      skills: entry?.skills?.join(", ") || "",
      difficulty_level: (entry?.difficulty_level as DifficultyLevel) || "BEGINNER",
      start_date: entry?.start_date ? new Date(entry.start_date) : new Date(),
      study_hours: entry?.completed_hours || 1
    }
  })

  const onSubmit = async (data: LearningFormData) => {
    try {
      setIsSubmitting(true)
      
      const entryData: LearningEntryInsert = {
        title: data.title,
        description: data.description,
        category: selectedCategories[0] || "OTHER", // 主カテゴリーとして最初のものを使用
        categories: selectedCategories,
        status: data.status,
        progress: data.progress,
        skills: data.skills.split(",").map(s => s.trim()).filter(s => s),
        difficulty_level: data.difficulty_level,
        estimated_hours: null,
        completed_hours: data.study_hours,
        start_date: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        target_completion_date: null,
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

      <div className="space-y-2">
        <Label>カテゴリ (複数選択可)</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(option => (
              <Badge
                key={option.value}
                variant={selectedCategories.includes(option.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer",
                  selectedCategories.includes(option.value)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:bg-gray-800"
                )}
                onClick={() => {
                  if (selectedCategories.includes(option.value)) {
                    setSelectedCategories(selectedCategories.filter(c => c !== option.value))
                  } else {
                    setSelectedCategories([...selectedCategories, option.value])
                  }
                  setValue("categories", selectedCategories)
                }}
              >
                {option.label}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="カスタムカテゴリを追加"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customCategory.trim()) {
                  e.preventDefault()
                  if (!selectedCategories.includes(customCategory.trim())) {
                    setSelectedCategories([...selectedCategories, customCategory.trim()])
                    setValue("categories", [...selectedCategories, customCategory.trim()])
                  }
                  setCustomCategory("")
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (customCategory.trim() && !selectedCategories.includes(customCategory.trim())) {
                  setSelectedCategories([...selectedCategories, customCategory.trim()])
                  setValue("categories", [...selectedCategories, customCategory.trim()])
                  setCustomCategory("")
                }
              }}
            >
              追加
            </Button>
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="pl-2">
                  {categoryOptions.find(o => o.value === cat)?.label || cat}
                  <button
                    type="button"
                    className="ml-1 hover:text-red-400"
                    onClick={() => {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat))
                      setValue("categories", selectedCategories.filter(c => c !== cat))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        {errors.categories && (
          <p className="text-sm text-red-500">{errors.categories.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">

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
          <Label>学習日 *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate)
                  if (newDate) {
                    setValue("start_date", newDate)
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && (
            <p className="text-sm text-red-500">{errors.start_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_hours">学習時間 (時間) *</Label>
          <Input
            id="study_hours"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            {...register("study_hours", { valueAsNumber: true })}
            placeholder="1.5"
          />
          {errors.study_hours && (
            <p className="text-sm text-red-500">{errors.study_hours.message}</p>
          )}
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