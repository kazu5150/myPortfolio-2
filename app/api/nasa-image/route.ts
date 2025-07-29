import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // n8n webhookのURLを環境変数から取得
    const n8nWebhookUrl = process.env.N8N_NASA_WEBHOOK_URL
    
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL が設定されていません' },
        { status: 500 }
      )
    }

    // n8n webhookを呼び出し
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trigger: 'get_nasa_image',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`N8N webhook呼び出しエラー: ${response.status}`)
    }

    const data = await response.json()

    // レスポンスデータの検証
    if (!data.title || !data.imageUrl || !data.explanation) {
      throw new Error('無効なレスポンスデータ')
    }

    // クライアントに返すデータの整形
    const nasaImageData = {
      title: data.title,
      description: data.description || data.explanation,
      imageUrl: data.imageUrl || data.url,
      date: data.date || new Date().toISOString().split('T')[0],
      explanation: data.explanation || data.aiExplanation || 'AI解説が利用できません',
    }

    return NextResponse.json(nasaImageData)

  } catch (error) {
    console.error('NASA画像取得エラー:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        details: 'n8n webhookとの通信に失敗しました'
      },
      { status: 500 }
    )
  }
}

// POSTメソッドも対応（必要に応じて）
export async function POST(request: NextRequest) {
  return GET(request)
}