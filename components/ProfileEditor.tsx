"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { toast } from "sonner"

export interface ProfileData {
  name: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

interface ProfileEditorProps {
  isOpen: boolean
  onClose: () => void
  profileData: ProfileData
  onSave: (data: ProfileData) => void
}

export function ProfileEditor({ isOpen, onClose, profileData, onSave }: ProfileEditorProps) {
  const [formData, setFormData] = useState<ProfileData>(profileData)

  const handleSave = () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error("名前とタイトルは必須です")
      return
    }

    onSave(formData)
    toast.success("プロフィールを更新しました")
    onClose()
  }

  const handleReset = () => {
    setFormData(profileData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            プロフィール編集
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
          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: Matsuzawa"
            />
          </div>

          {/* 肩書き */}
          <div className="space-y-2">
            <Label htmlFor="title">肩書き</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: , the AI software engineer"
            />
          </div>

          {/* サブタイトル */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">サブタイトル</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="例: 副業から本業へ転身する開発者の成長記録。&#10;AIとテクノロジーで未来を築く。"
              rows={3}
            />
          </div>

          {/* CTAボタンテキスト */}
          <div className="space-y-2">
            <Label htmlFor="ctaText">CTAボタンテキスト</Label>
            <Input
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              placeholder="例: Start exploring"
            />
          </div>

          {/* CTAリンク */}
          <div className="space-y-2">
            <Label htmlFor="ctaLink">CTAリンク</Label>
            <Input
              id="ctaLink"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              placeholder="例: /blog"
            />
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