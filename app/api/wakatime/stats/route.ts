import { NextRequest, NextResponse } from 'next/server'

const WAKATIME_API_BASE = 'https://wakatime.com/api/v1'

export async function GET(request: NextRequest) {
  // Try multiple possible environment variable names
  const apiKey = process.env.WAKATIME_API_KEY || process.env.NEXT_PUBLIC_WAKATIME_API_KEY || process.env.WAKATIME_SECRET
  
  console.log('WakaTime API Debug:', {
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
    keyLength: apiKey ? apiKey.length : 0,
    env: {
      WAKATIME_API_KEY: !!process.env.WAKATIME_API_KEY,
      NEXT_PUBLIC_WAKATIME_API_KEY: !!process.env.NEXT_PUBLIC_WAKATIME_API_KEY,
      WAKATIME_SECRET: !!process.env.WAKATIME_SECRET
    }
  })
  
  if (!apiKey) {
    console.warn('WakaTime API key not found - returning demo data')
    return NextResponse.json({
      languageStats: [
        { name: 'TypeScript', hours: 45.5, percent: 35 },
        { name: 'React', hours: 32.2, percent: 25 },
        { name: 'Next.js', hours: 25.8, percent: 20 },
        { name: 'CSS', hours: 19.4, percent: 15 },
        { name: 'JavaScript', hours: 6.5, percent: 5 }
      ],
      projectStats: [
        { name: 'Portfolio Dashboard', hours: 89.2, percent: 70 },
        { name: 'Learning Platform', hours: 25.5, percent: 20 },
        { name: 'Blog CMS', hours: 12.8, percent: 10 }
      ],
      dailyHours: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours: Math.random() * 8,
        total_seconds: Math.floor(Math.random() * 28800),
        languages: [],
        projects: []
      }))
    })
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
        console.error('WakaTime summaries API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        // Return demo data instead of throwing error
        return NextResponse.json({
          dailyHours: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hours: Math.random() * 8,
            total_seconds: Math.floor(Math.random() * 28800),
            languages: [],
            projects: []
          }))
        })
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
        console.error('WakaTime stats API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        // Return demo data instead of throwing error
        return NextResponse.json({
          languageStats: [
            { name: 'TypeScript', hours: 45.5, percent: 35 },
            { name: 'React', hours: 32.2, percent: 25 },
            { name: 'Next.js', hours: 25.8, percent: 20 },
            { name: 'CSS', hours: 19.4, percent: 15 },
            { name: 'JavaScript', hours: 6.5, percent: 5 }
          ],
          projectStats: [
            { name: 'Portfolio Dashboard', hours: 89.2, percent: 70 },
            { name: 'Learning Platform', hours: 25.5, percent: 20 },
            { name: 'Blog CMS', hours: 12.8, percent: 10 }
          ],
          totalSeconds: 324000,
          dailyAverage: 3600
        })
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
    
    // Return demo data instead of error response
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || 'stats'
    
    if (endpoint === 'summaries') {
      return NextResponse.json({
        dailyHours: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hours: Math.random() * 8,
          total_seconds: Math.floor(Math.random() * 28800),
          languages: [],
          projects: []
        }))
      })
    } else {
      return NextResponse.json({
        languageStats: [
          { name: 'TypeScript', hours: 45.5, percent: 35 },
          { name: 'React', hours: 32.2, percent: 25 },
          { name: 'Next.js', hours: 25.8, percent: 20 },
          { name: 'CSS', hours: 19.4, percent: 15 },
          { name: 'JavaScript', hours: 6.5, percent: 5 }
        ],
        projectStats: [
          { name: 'Portfolio Dashboard', hours: 89.2, percent: 70 },
          { name: 'Learning Platform', hours: 25.5, percent: 20 },
          { name: 'Blog CMS', hours: 12.8, percent: 10 }
        ],
        totalSeconds: 324000,
        dailyAverage: 3600
      })
    }
  }
}