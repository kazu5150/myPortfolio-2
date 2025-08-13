import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // n8n webhookエンドポイントにリクエストを送信
    const response = await fetch('https://n8n.srv927568.hstgr.cloud/webhook/n8n-myPortfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Landing page evaluation error:', error)
    return NextResponse.json(
      { error: 'ランディングページの評価中にエラーが発生しました' },
      { status: 500 }
    )
  }
}