import { N8NChatbot } from '@/components/n8n-chatbot'

export default function N8NStarWarsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">スター・ウォーズ AI チャット</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            n8nワークフローを使用したスター・ウォーズの専門AIとチャットしてください
          </p>
        </div>
        
        <div className="flex justify-center">
          <N8NChatbot />
        </div>
      </div>
    </div>
  )
}