import { Sparkles, Brain, Wand2, Cpu, Zap, Bot, Image, Twitter, Eye } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Playground - AI実験室',
  description: '最新のAI技術を活用した実験的なプロジェクトを体験できる場所',
}

export default function AIPlaygroundPage() {
  const experiments = [
    {
      id: 1,
      title: 'NASA画像エクスプローラー',
      description: 'NASAの宇宙画像をAIが詳しく解説',
      icon: <Image className="w-6 h-6" />,
      status: 'available',
      gradient: 'from-blue-500 to-cyan-500',
      href: '/ai-playground/nasa-explorer',
    },
    {
      id: 2,
      title: 'Twitter検索エクスプローラー',
      description: 'Twitter APIでリアルタイムなツイートを検索・分析',
      icon: <Twitter className="w-6 h-6" />,
      status: 'available',
      gradient: 'from-blue-400 to-blue-600',
      href: '/ai-playground/twitter-explorer',
    },
    {
      id: 3,
      title: 'MediaPipe ランドマーク検出',
      description: 'カメラを使って顔や手のランドマークをリアルタイム検出',
      icon: <Eye className="w-6 h-6" />,
      status: 'available',
      gradient: 'from-emerald-500 to-green-500',
      href: '/ai-playground/mediapipe-landmarks',
    },
    {
      id: 4,
      title: 'テキスト生成AI',
      description: 'GPTモデルを使用した創造的なテキスト生成',
      icon: <Brain className="w-6 h-6" />,
      status: 'coming-soon',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 5,
      title: '画像生成AI',
      description: 'プロンプトから画像を生成する実験',
      icon: <Wand2 className="w-6 h-6" />,
      status: 'coming-soon',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 6,
      title: 'コード生成アシスタント',
      description: 'AIを使用したコード補完と生成',
      icon: <Cpu className="w-6 h-6" />,
      status: 'coming-soon',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      id: 7,
      title: 'リアルタイム翻訳',
      description: '多言語間のリアルタイム翻訳システム',
      icon: <Zap className="w-6 h-6" />,
      status: 'coming-soon',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      id: 8,
      title: 'AIチャットボット',
      description: 'カスタマイズ可能な対話型AI',
      icon: <Bot className="w-6 h-6" />,
      status: 'coming-soon',
      gradient: 'from-pink-500 to-rose-500',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">AI実験室</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-thin mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI Playground
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
            最新のAI技術を活用した実験的なプロジェクトを体験できる場所
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>実験稼働中</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
            <span>毎週新しい実験を追加予定</span>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Experiments Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => {
              const ExperimentCard = experiment.href ? Link : 'div'
              return (
                <ExperimentCard
                  key={experiment.id}
                  href={experiment.href || '#'}
                  className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer block"
                >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${experiment.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${experiment.gradient} text-white mb-4`}>
                    {experiment.icon}
                  </div>

                  <h3 className="text-xl font-light text-white mb-2">
                    {experiment.title}
                  </h3>

                  <p className="text-gray-400 mb-4">
                    {experiment.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      experiment.status === 'available' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {experiment.status === 'coming-soon' ? '近日公開' : '利用可能'}
                    </span>
                    
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                      <span className="text-sm">
                        {experiment.status === 'available' ? '体験する' : '詳細を見る'}
                      </span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </ExperimentCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-thin text-white text-center mb-12">
            なぜAI Playgroundなのか？
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">最新技術</h3>
              <p className="text-gray-400">常に最新のAI技術を試すことができます</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">高速実行</h3>
              <p className="text-gray-400">最適化されたモデルで高速な応答を実現</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-light text-white mb-2">学習機会</h3>
              <p className="text-gray-400">AIの仕組みを実際に体験しながら学べます</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}