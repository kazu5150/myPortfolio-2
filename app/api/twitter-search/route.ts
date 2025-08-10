import { NextRequest, NextResponse } from 'next/server'

const API_ENDPOINT = "https://api.twitterapi.io/twitter/tweet/advanced_search"

export async function GET(request: NextRequest) {
  try {
    // 環境変数からTwitter API keyを取得
    const apiKey = process.env.TWAPI_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Twitter API キーが設定されていません' },
        { status: 500 }
      )
    }

    // URLパラメータからクエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || 'AI'
    const lang = searchParams.get('lang') || 'ja'
    const limit = parseInt(searchParams.get('limit') || '50')
    const sort = searchParams.get('sort') || 'recency'
    
    // バリデーション
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: '取得件数は1～100の範囲で指定してください' },
        { status: 400 }
      )
    }
    
    if (!['recency', 'relevance'].includes(sort)) {
      return NextResponse.json(
        { error: 'ソート順は recency または relevance を指定してください' },
        { status: 400 }
      )
    }

    // Twitter APIに送信するクエリを構築
    const searchQuery = `${query} lang:${lang}`
    
    // リクエストパラメータを構築
    const params = new URLSearchParams({
      query: searchQuery,
      limit: limit.toString(),
      sort_order: sort,
    })

    const requestUrl = `${API_ENDPOINT}?${params.toString()}`
    
    // Twitter APIを呼び出し
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js API Route',
        'X-API-Key': apiKey,
        'Accept': 'application/json',
      },
      // 60秒のタイムアウト
      signal: AbortSignal.timeout(60000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Twitter API Error: ${response.status} - ${errorText}`)
      
      return NextResponse.json(
        { 
          error: `Twitter API呼び出しエラー: ${response.status}`,
          details: response.statusText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // デバッグ用：レスポンス構造を確認
    console.log('Twitter API Response structure:', JSON.stringify(data, null, 2))
    
    // レスポンスデータの検証
    if (!data || typeof data !== 'object') {
      throw new Error('無効なレスポンスデータ')
    }

    // クライアントに返すデータの整形
    const twitterData = {
      query: searchQuery,
      results: data,
      meta: {
        timestamp: new Date().toISOString(),
        limit,
        sort,
        lang
      }
    }

    return NextResponse.json(twitterData)

  } catch (error) {
    console.error('Twitter検索エラー:', error)
    
    // タイムアウトエラーの場合
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: 'リクエストがタイムアウトしました',
          details: 'Twitter APIの応答が60秒以内に得られませんでした'
        },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        details: 'Twitter APIとの通信に失敗しました'
      },
      { status: 500 }
    )
  }
}

// POSTメソッドも対応
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query = 'AI', lang = 'ja', limit = 50, sort = 'recency' } = body
    
    // クエリパラメータを作成してGETメソッドに委譲
    const url = new URL(request.url)
    url.searchParams.set('query', query)
    url.searchParams.set('lang', lang)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('sort', sort)
    
    const newRequest = new NextRequest(url, {
      method: 'GET',
      headers: request.headers,
    })
    
    return GET(newRequest)
  } catch (error) {
    return NextResponse.json(
      { error: 'リクエストボディの解析に失敗しました' },
      { status: 400 }
    )
  }
}