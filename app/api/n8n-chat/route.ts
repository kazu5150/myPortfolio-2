import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: '質問が入力されていません' },
        { status: 400 }
      )
    }

    const response = await fetch('https://n8n.srv927568.hstgr.cloud/webhook/rag-starwars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question
      }),
    })

    if (!response.ok) {
      throw new Error(`N8N API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({ response: data })
  } catch (error) {
    console.error('N8N API Error:', error)
    return NextResponse.json(
      { error: 'AIからの応答の取得に失敗しました' },
      { status: 500 }
    )
  }
}