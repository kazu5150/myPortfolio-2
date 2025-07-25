"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)

      // ファイル名を生成（タイムスタンプ + ランダム文字列）
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `projects/${fileName}`

      // Supabaseストレージにアップロード
      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // パブリックURLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success("画像をアップロードしました")
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error(`画像のアップロードに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async () => {
    if (!value) return

    try {
      // URLから相対パスを抽出
      const url = new URL(value)
      const pathParts = url.pathname.split('/')
      const filePath = pathParts.slice(-2).join('/') // projects/filename.ext

      // Supabaseストレージから削除
      const { error } = await supabase.storage
        .from('project-images')
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        // 削除エラーでも続行（ファイルが既に存在しない場合など）
      }

      onChange(null)
      toast.success("画像を削除しました")
    } catch (error) {
      console.error('Remove error:', error)
      // エラーが発生してもUIから削除
      onChange(null)
      toast.success("画像を削除しました")
    }
  }

  const validateAndUploadFile = (file: File) => {
    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください")
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      toast.error("画像ファイルを選択してください")
      return
    }

    uploadImage(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    validateAndUploadFile(file)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !uploading) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (!imageFile) {
      toast.error("画像ファイルをドロップしてください")
      return
    }

    validateAndUploadFile(imageFile)
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="relative">
          <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
            <img
              src={value}
              alt="プロジェクト画像"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white border-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-blue-500 bg-blue-500/10"
              : uploading
              ? "border-gray-600 bg-gray-800/50"
              : "border-gray-700 hover:border-gray-600"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
              <p className="text-gray-400 text-sm">アップロード中...</p>
            </>
          ) : isDragOver ? (
            <>
              <Upload className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-blue-400 text-sm font-medium">ここに画像をドロップ</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-400 text-sm">クリックまたはドラッグ&ドロップで画像をアップロード</p>
              <p className="text-gray-500 text-xs mt-1">PNG, JPG, WebP, GIF (最大5MB)</p>
            </>
          )}
        </div>
      )}

      {value && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Upload className="h-4 w-4 mr-2" />
            画像を変更
          </Button>
        </div>
      )}
    </div>
  )
}