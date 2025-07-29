'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Sparkles, Image, Loader2, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NasaImageData {
  title: string
  description: string
  imageUrl: string
  date: string
  explanation: string
}

export default function NasaExplorerPage() {
  const [imageData, setImageData] = useState<NasaImageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNasaImage = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/nasa-image')
      if (!response.ok) {
        throw new Error('画像の取得に失敗しました')
      }
      
      const data = await response.json()
      setImageData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <header className="relative py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/ai-playground" 
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AI Playgroundに戻る</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Image className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">NASA画像エクスプローラー</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              宇宙の神秘を探る
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              NASAの今日の画像をAIが詳しく解説します
            </p>
          </div>
        </div>

        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Generate Button */}
          <div className="text-center mb-12">
            <button
              onClick={fetchNasaImage}
              disabled={isLoading}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>画像を取得中...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>今日のNASA画像を取得</span>
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Image Display */}
          {imageData && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="relative group">
                    <div className="aspect-video w-full overflow-hidden rounded-xl">
                      <img
                        src={imageData.imageUrl}
                        alt={imageData.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {imageData.title}
                      </h2>
                      <p className="text-sm text-gray-400">{imageData.date}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-400" />
                          AI解説
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                          {imageData.explanation}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          NASA公式説明
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {imageData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!imageData && !isLoading && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  宇宙の美しさを発見しよう
                </h3>
                <p className="text-gray-400 mb-6">
                  ボタンをクリックして、NASAの今日の画像とAIによる詳しい解説を取得しましょう。
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>NASA APOD API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span>AI解説生成</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}