import { N8NChatbot } from '@/components/n8n-chatbot'

export default function N8NStarWarsPage() {
  const characterImages = [
    { name: 'luke', position: 'top-10 left-10', opacity: '0.15', size: 'w-32 h-32', delay: '0s' },
    { name: 'leia', position: 'top-20 right-20', opacity: '0.12', size: 'w-28 h-28', delay: '2s' },
    { name: 'han', position: 'bottom-32 left-20', opacity: '0.18', size: 'w-36 h-36', delay: '4s' },
    { name: 'obi-wan', position: 'bottom-20 right-10', opacity: '0.14', size: 'w-30 h-30', delay: '1s' },
    { name: 'yoda', position: 'top-1/3 left-1/4', opacity: '0.16', size: 'w-24 h-24', delay: '3s' },
    { name: 'qui-gon', position: 'top-1/2 right-1/3', opacity: '0.13', size: 'w-32 h-32', delay: '5s' },
    { name: 'rey', position: 'bottom-1/3 left-1/3', opacity: '0.15', size: 'w-28 h-28', delay: '1.5s' },
    { name: 'ahsoka', position: 'top-2/3 right-1/4', opacity: '0.17', size: 'w-34 h-34', delay: '3.5s' },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 星空背景エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black"></div>
      
      {/* 星のアニメーション */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 2}s`
            }}
          />
        ))}
      </div>

      {/* キャラクター画像 - フォールバック用のプレースホルダー */}
      {characterImages.map((char, index) => (
        <div
          key={index}
          className={`absolute ${char.position} ${char.size} rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 backdrop-blur-sm animate-pulse`}
          style={{
            opacity: char.opacity,
            animationDelay: char.delay,
            animationDuration: '4s'
          }}
        />
      ))}

      {/* メインコンテンツ */}
      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <span className="text-sm text-yellow-300">May the Force be with you</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent tracking-wider">
            STAR WARS
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-light text-blue-300 mb-4 tracking-wide">
            AI チャット
          </h2>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            遠い昔、はるか彼方の銀河系で...<br />
            n8nワークフローを使用したスター・ウォーズの専門AIと会話しよう
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            {/* チャットボットの周りのグロー効果 */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse"></div>
            <div className="relative">
              <N8NChatbot />
            </div>
          </div>
        </div>
      </div>
      
      {/* 下部のライトサーバー効果 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-32 bg-gradient-to-t from-blue-400 to-transparent opacity-50 animate-pulse"></div>
    </div>
  )
}