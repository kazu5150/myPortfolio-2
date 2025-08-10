'use client'

import { useState } from 'react'
import { Twitter, Search, Loader2, ArrowLeft, MessageCircle, Heart, Repeat, ExternalLink, Filter } from 'lucide-react'
import Link from 'next/link'

interface TwitterSearchData {
  query: string
  results: {
    data?: Array<{
      id: string
      text: string
      created_at: string
      author_id: string
      public_metrics?: {
        retweet_count: number
        like_count: number
        reply_count: number
        quote_count: number
      }
    }>
    includes?: {
      users?: Array<{
        id: string
        name: string
        username: string
        profile_image_url?: string
        verified?: boolean
      }>
    }
    meta?: {
      result_count: number
      next_token?: string
    }
  } | any // APIレスポンス形式が異なる場合に対応
  meta: {
    timestamp: string
    limit: number
    sort: string
    lang: string
  }
}

export default function TwitterExplorerPage() {
  const [searchData, setSearchData] = useState<TwitterSearchData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('AI')
  const [limit, setLimit] = useState(50)
  const [sort, setSort] = useState<'recency' | 'relevance'>('recency')
  const [lang, setLang] = useState('ja')

  const performSearch = async () => {
    if (!query.trim()) {
      setError('検索キーワードを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: limit.toString(),
        sort,
        lang
      })
      
      const response = await fetch(`/api/twitter-search?${params}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'ツイート検索に失敗しました')
      }
      
      const data = await response.json()
      console.log('Received API response:', data)
      console.log('Response results structure:', data.results)
      setSearchData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      performSearch()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '不明'
    
    try {
      // Unix timestampの場合（数値文字列）
      if (/^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString)
        const date = new Date(timestamp * 1000) // Unix timestampは秒単位
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      }
      
      // ISO形式の場合
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      // Twitter形式の日付（例: "Mon Oct 05 20:34:02 +0000 2020"）
      if (dateString.includes(' ')) {
        const twitterDate = new Date(dateString)
        if (!isNaN(twitterDate.getTime())) {
          return twitterDate.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      }
      
      // その他の形式を試す
      const timestamp = Date.parse(dateString)
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp)
        return date.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      return '日付不明'
    } catch {
      return '日付不明'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-black">
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
              <Twitter className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Twitter検索エクスプローラー</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-thin text-white mb-4 tracking-tight">
              リアルタイムな声を探る
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-light">
              Twitter Advanced Search APIで日本語ツイートを収集・分析
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
          {/* Search Panel */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="space-y-6">
                {/* Search Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-light text-white">
                    <Search className="w-5 h-5 text-blue-400" />
                    検索キーワード
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="AIやChatGPTなどのキーワードを入力..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Search Options */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-light text-gray-300">
                      <Filter className="w-4 h-4 text-purple-400" />
                      取得件数
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    >
                      <option value={20}>20件</option>
                      <option value={50}>50件</option>
                      <option value={100}>100件</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-light text-gray-300">
                      <Filter className="w-4 h-4 text-purple-400" />
                      ソート順
                    </label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as 'recency' | 'relevance')}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    >
                      <option value="recency">新しい順</option>
                      <option value="relevance">関連度順</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-light text-gray-300">
                      <Filter className="w-4 h-4 text-purple-400" />
                      言語
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    >
                      <option value="ja">日本語</option>
                      <option value="en">英語</option>
                      <option value="all">すべて</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={performSearch}
                  disabled={isLoading || !query.trim()}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>検索中...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>ツイートを検索</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchData && searchData.results && (
            <div className="max-w-4xl mx-auto">
              {/* Results Header */}
              <div className="mb-6 p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-light text-white">
                      「{searchData.query}」の検索結果
                    </h3>
                    {searchData.results.meta && (
                      <p className="text-sm text-gray-400">
                        {searchData.results.meta.result_count || searchData.results.tweets?.length || 0} 件のツイートを取得
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    検索実行: {new Date(searchData.meta.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>

              {/* Tweet List */}
              {(() => {
                // APIレスポンス形式を判定して適切にデータを取得
                let tweets: any[] = []
                let users: { [key: string]: any } = {}
                
                if (searchData.results.data) {
                  // Twitter API v2形式
                  tweets = searchData.results.data
                  if (searchData.results.includes?.users) {
                    searchData.results.includes.users.forEach(user => {
                      users[user.id] = user
                    })
                  }
                } else if (searchData.results.tweets) {
                  // カスタム形式
                  tweets = searchData.results.tweets
                } else if (Array.isArray(searchData.results)) {
                  // 配列形式
                  tweets = searchData.results
                } else if (searchData.results && typeof searchData.results === 'object') {
                  // オブジェクト内の配列を探す
                  const possibleArrays = Object.values(searchData.results).filter(Array.isArray)
                  if (possibleArrays.length > 0) {
                    tweets = possibleArrays[0] as any[]
                  }
                }

                return tweets && tweets.length > 0 ? (
                  <div className="space-y-4">
                    {tweets.map((tweet, index) => {
                      // デバッグ用：ツイートオブジェクトの構造を確認
                      if (index === 0) {
                        console.log('Full tweet object:', tweet)
                        console.log('All tweet keys:', Object.keys(tweet))
                        console.log('Available date fields:', {
                          created_at: tweet.created_at,
                          created_time: tweet.created_time,
                          timestamp: tweet.timestamp,
                          date: tweet.date,
                          time: tweet.time,
                          published_at: tweet.published_at,
                          tweet_created_at: tweet.tweet_created_at,
                          created: tweet.created
                        })
                      }
                      
                      // ユーザー情報を取得（API v2形式の場合）
                      const author = tweet.author || users[tweet.author_id] || {
                        name: tweet.user?.name || `User${index + 1}`,
                        username: tweet.user?.screen_name || tweet.username || `user${index + 1}`,
                        profile_image_url: tweet.user?.profile_image_url_https,
                        verified: tweet.user?.verified || false
                      }
                      
                      const tweetId = tweet.id_str || tweet.id
                      const tweetText = tweet.full_text || tweet.text || ''
                      // 多数の可能性のある日付フィールドを確認
                      const createdAt = tweet.created_at || 
                                      tweet.created_time || 
                                      tweet.timestamp || 
                                      tweet.date || 
                                      tweet.time || 
                                      tweet.published_at ||
                                      tweet.tweet_created_at ||
                                      tweet.created ||
                                      tweet.datetime ||
                                      tweet.publish_time ||
                                      tweet.post_time ||
                                      ''
                      
                      // デバッグ用：実際に使用された日付フィールドを表示
                      if (index === 0) {
                        console.log('Selected createdAt value:', createdAt)
                        console.log('createdAt type:', typeof createdAt)
                      }
                      const metrics = tweet.public_metrics || {
                        reply_count: tweet.reply_count || 0,
                        retweet_count: tweet.retweet_count || 0,
                        like_count: tweet.favorite_count || tweet.like_count || 0,
                        quote_count: tweet.quote_count || 0
                      }

                      return (
                        <div key={tweetId || index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                          {/* Tweet Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {author.profile_image_url ? (
                              <img
                                src={author.profile_image_url}
                                alt={author.name}
                                className="w-10 h-10 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  target.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center ${author.profile_image_url ? 'hidden' : ''}`}>
                              <Twitter className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-white truncate">{author.name}</span>
                                {author.verified && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                                <span className="text-gray-400 text-sm">@{author.username}</span>
                                <span className="text-gray-500 text-sm">·</span>
                                <span className="text-gray-500 text-sm">
                                  {createdAt ? formatDate(createdAt) : '時間不明'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tweet Content */}
                          <div className="mb-4">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                              {tweetText}
                            </p>
                          </div>

                          {/* Tweet Metrics and Link */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{formatNumber(metrics.reply_count)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Repeat className="w-4 h-4" />
                                <span>{formatNumber(metrics.retweet_count)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{formatNumber(metrics.like_count)}</span>
                              </div>
                            </div>
                            
                            {/* Tweet Link */}
                            <a
                              href={`https://twitter.com/${author.username}/status/${tweetId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Twitter className="w-4 h-4" />
                              <span>ツイートを見る</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Twitter className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-thin text-white mb-2">
                      ツイートが見つかりませんでした
                    </h3>
                    <p className="text-gray-400">
                      別のキーワードで検索してみてください。
                    </p>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Initial State */}
          {!searchData && !isLoading && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                <Twitter className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-thin text-white mb-2">
                  Twitter上の声を探してみよう
                </h3>
                <p className="text-gray-400 mb-6">
                  キーワードを入力してTwitter上の最新の会話を探索しましょう。
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>リアルタイム検索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span>高度なフィルタリング</span>
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