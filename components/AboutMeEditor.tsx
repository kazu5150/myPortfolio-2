"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export interface AboutMeData {
  title: string
  subtitle: string
  profileTitle: string
  profileParagraphs: string[]
  skillsTitle: string
  skills: string[]
}

interface AboutMeEditorProps {
  isOpen: boolean
  onClose: () => void
  aboutMeData: AboutMeData
  onSave: (data: AboutMeData) => void
}

export function AboutMeEditor({ isOpen, onClose, aboutMeData, onSave }: AboutMeEditorProps) {
  const [formData, setFormData] = useState<AboutMeData>(aboutMeData)

  const handleSave = () => {
    if (!formData.title.trim() || !formData.profileTitle.trim()) {
      toast.error("タイトルとプロフィールタイトルは必須です")
      return
    }

    onSave(formData)
    toast.success("About Meを更新しました")
    onClose()
  }

  const handleReset = () => {
    setFormData(aboutMeData)
  }

  const addParagraph = () => {
    setFormData({
      ...formData,
      profileParagraphs: [...formData.profileParagraphs, ""]
    })
  }

  const removeParagraph = (index: number) => {
    setFormData({
      ...formData,
      profileParagraphs: formData.profileParagraphs.filter((_, i) => i !== index)
    })
  }

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...formData.profileParagraphs]
    newParagraphs[index] = value
    setFormData({
      ...formData,
      profileParagraphs: newParagraphs
    })
  }

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, ""]
    })
  }

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    })
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills]
    newSkills[index] = value
    setFormData({
      ...formData,
      skills: newSkills
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            About Me編集
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* メインタイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">メインタイトル</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: About Me"
            />
          </div>

          {/* サブタイトル */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">サブタイトル</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="例: AIとプログラミングの力で、学習を可視化し、成長を加速させる開発者"
              rows={2}
            />
          </div>

          {/* プロフィールタイトル */}
          <div className="space-y-2">
            <Label htmlFor="profileTitle">プロフィールセクションタイトル</Label>
            <Input
              id="profileTitle"
              value={formData.profileTitle}
              onChange={(e) => setFormData({ ...formData, profileTitle: e.target.value })}
              placeholder="例: Profile"
            />
          </div>

          {/* プロフィール段落 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>プロフィール文章</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParagraph}
              >
                <Plus className="h-4 w-4 mr-1" />
                段落追加
              </Button>
            </div>
            
            {formData.profileParagraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={paragraph}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  placeholder={`段落 ${index + 1}`}
                  rows={3}
                  className="flex-1"
                />
                {formData.profileParagraphs.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeParagraph(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* スキルタイトル */}
          <div className="space-y-2">
            <Label htmlFor="skillsTitle">スキルセクションタイトル</Label>
            <Input
              id="skillsTitle"
              value={formData.skillsTitle}
              onChange={(e) => setFormData({ ...formData, skillsTitle: e.target.value })}
              placeholder="例: Technical Skills"
            />
          </div>

          {/* スキル */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>スキル</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSkill}
              >
                <Plus className="h-4 w-4 mr-1" />
                スキル追加
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    placeholder={`スキル ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleReset}>
              リセット
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}