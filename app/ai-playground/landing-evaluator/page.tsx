'use client'

import { useState } from 'react'
import { Search, Loader2, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EvaluationResult {
  output: string
}

export default function LandingEvaluatorPage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/evaluate-landing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '評価中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSummary = (text: string) => {
    // 【ロースト】セクションから最初の2-3文を抽出して辛口総評を作成
    const roastMatch = text.match(/【ロースト】\n(.*?)(?=\n\n|【)/s)
    if (roastMatch) {
      const roastContent = roastMatch[1].trim()
      // 最初の文または最初の100文字程度を抜き出して総評とする
      const firstSentence = roastContent.split('。')[0] + '。'
      if (firstSentence.length <= 120) {
        return firstSentence
      } else {
        // 長すぎる場合は100文字程度で区切る
        return roastContent.substring(0, 100) + '...'
      }
    }
    
    // ロースト部分がない場合は一般的な総評
    const hasRecommendations = text.includes('推奨') || text.includes('改善')
    if (hasRecommendations) {
      return "ランディングページの改善点と具体的な対策案をAIが分析しました。ユーザー体験向上とコンバージョン率アップのためのアドバイスをご確認ください。"
    }
    
    return "AIがランディングページを詳細に分析し、改善のための具体的なアドバイスを提供しています。ぜひご活用ください。"
  }

  const formatEvaluationText = (text: string) => {
    // 改行を<br>に変換し、セクションを分けて表示しやすくする
    return text
      .split('\n')
      .map((line, index) => {
        // 見出し（【】で囲まれた部分）を強調表示
        if (line.includes('【') && line.includes('】')) {
          return (
            <h3 key={index} className="text-xl font-bold text-cyan-400 mt-6 mb-3">
              {line}
            </h3>
          )
        }
        // 番号付きリスト（1. 2. など）を強調
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={index} className="text-blue-300 font-medium mt-4 mb-2">
              {line}
            </div>
          )
        }
        // 通常のテキスト
        if (line.trim()) {
          return (
            <p key={index} className="text-gray-300 mb-2 leading-relaxed">
              {line}
            </p>
          )
        }
        // 空行
        return <div key={index} className="mb-2"></div>
      })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">ランディングページ評価</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-thin mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Landing Page Evaluator
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            AIがあなたのランディングページを分析し、改善案を提案します
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-landing-page.com"
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800/80 transition-all"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isLoading ? '分析中...' : '評価開始'}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-light text-white">AI評価結果</h2>
              </div>
              
              {/* 総評 */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-medium text-cyan-300 mb-2">総評</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {generateSummary(result.output)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 詳細分析 */}
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-medium text-gray-400 mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gray-600"></span>
                  詳細分析
                </h3>
                {formatEvaluationText(result.output)}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}