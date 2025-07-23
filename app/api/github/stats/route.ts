import { NextRequest, NextResponse } from 'next/server'

const GITHUB_API_BASE = 'https://api.github.com'
// Force new deployment after env var changes

export async function GET(request: NextRequest) {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || process.env.GITHUB_USERNAME
  
  console.log('GitHub API Debug:', {
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 8) + '...' : 'none',
    username: username || 'none',
    env: {
      NEXT_PUBLIC_GITHUB_TOKEN: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      NEXT_PUBLIC_GITHUB_USERNAME: !!process.env.NEXT_PUBLIC_GITHUB_USERNAME,
      GITHUB_USERNAME: !!process.env.GITHUB_USERNAME
    }
  })
  
  if (!token || !username) {
    return NextResponse.json(
      { 
        error: 'GitHub credentials not configured',
        debug: {
          hasToken: !!token,
          hasUsername: !!username
        }
      },
      { status: 400 }
    )
  }

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Dashboard'
  }

  try {
    // Fetch user repos
    const reposResponse = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
    )
    
    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status} ${reposResponse.statusText}`)
    }
    
    const repos = await reposResponse.json()

    // Fetch user events for activity data
    const eventsResponse = await fetch(
      `${GITHUB_API_BASE}/users/${username}/events?per_page=100`,
      { headers }
    )
    
    const events = eventsResponse.ok ? await eventsResponse.json() : []

    // Process activity data
    const activityMap = new Map<string, number>()
    events.forEach((event: any) => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      activityMap.set(date, (activityMap.get(date) || 0) + 1)
    })

    // Generate last 365 days activity
    const activity = []
    const endDate = new Date()
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      activity.push({
        date: dateString,
        count: activityMap.get(dateString) || 0
      })
    }

    // Get commits from recent repos
    const recentRepos = repos.slice(0, 5)
    const allCommits = []
    const languageStats: Record<string, number> = {}

    for (const repo of recentRepos) {
      try {
        // Get recent commits
        const since = new Date()
        since.setDate(since.getDate() - 30)
        
        const commitsResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${username}/${repo.name}/commits?author=${username}&per_page=100&since=${since.toISOString()}`,
          { headers }
        )
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json()
          allCommits.push(...commits)
        }

        // Get language stats
        const languagesResponse = await fetch(
          `${GITHUB_API_BASE}/repos/${username}/${repo.name}/languages`,
          { headers }
        )
        
        if (languagesResponse.ok) {
          const languages = await languagesResponse.json()
          Object.entries(languages).forEach(([lang, bytes]) => {
            languageStats[lang] = (languageStats[lang] || 0) + (bytes as number)
          })
        }
      } catch (error) {
        console.warn(`Failed to fetch data for repo ${repo.name}:`, error)
      }
    }

    const stats = {
      totalRepos: repos.length,
      totalCommits: allCommits.length,
      languageStats,
      activity,
      recentRepos: repos.slice(0, 10)
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    )
  }
}