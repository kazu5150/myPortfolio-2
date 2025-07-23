import { NextRequest, NextResponse } from 'next/server'

const WAKATIME_API_BASE = 'https://wakatime.com/api/v1'

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_WAKATIME_API_KEY || process.env.WAKATIME_API_KEY
  
  console.log('WakaTime API Debug:', {
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
    keyLength: apiKey ? apiKey.length : 0
  })
  
  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'WakaTime API key not configured',
        debug: {
          hasApiKey: !!apiKey
        }
      },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'last_30_days'
  const endpoint = searchParams.get('endpoint') || 'stats'

  try {
    let data = null

    if (endpoint === 'summaries') {
      const endDate = new Date()
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 30)
      
      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]
      
      const response = await fetch(
        `${WAKATIME_API_BASE}/users/current/summaries?start=${start}&end=${end}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('WakaTime API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`WakaTime API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const summaries = await response.json()
      
      // Process daily hours
      const dailyHours = summaries.data?.map((day: any) => ({
        date: day.range.date,
        hours: (day.grand_total?.hours || 0) + ((day.grand_total?.minutes || 0) / 60),
        total_seconds: day.grand_total?.total_seconds || 0,
        languages: day.languages || [],
        projects: day.projects || []
      })) || []
      
      data = { dailyHours }
      
    } else {
      // Default stats endpoint
      const response = await fetch(
        `${WAKATIME_API_BASE}/users/current/stats/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('WakaTime API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`WakaTime API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const stats = await response.json()
      
      data = {
        languageStats: stats.data?.languages || [],
        projectStats: stats.data?.projects || [],
        totalSeconds: stats.data?.total_seconds || 0,
        dailyAverage: stats.data?.daily_average || 0
      }
    }

    return NextResponse.json(data)
    
  } catch (error) {
    console.error('WakaTime API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch WakaTime data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}