interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
}

interface GitHubLanguageStats {
  [language: string]: number
}

export class GitHubAPI {
  private baseUrl = 'https://api.github.com'
  private token: string | null

  constructor() {
    this.token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || null
  }

  private async fetchWithAuth(url: string) {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-Dashboard'
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      return await this.fetchWithAuth(`${this.baseUrl}/users/${username}/repos?sort=updated&per_page=100`)
    } catch (error) {
      console.warn('GitHub API not available:', error)
      return []
    }
  }

  async getRepoCommits(username: string, repo: string, since?: string): Promise<GitHubCommit[]> {
    try {
      const sinceParam = since ? `&since=${since}` : ''
      return await this.fetchWithAuth(`${this.baseUrl}/repos/${username}/${repo}/commits?per_page=100${sinceParam}`)
    } catch (error) {
      console.warn(`GitHub commits not available for ${repo}:`, error)
      return []
    }
  }

  async getRepoLanguages(username: string, repo: string): Promise<GitHubLanguageStats> {
    try {
      return await this.fetchWithAuth(`${this.baseUrl}/repos/${username}/${repo}/languages`)
    } catch (error) {
      console.warn(`GitHub languages not available for ${repo}:`, error)
      return {}
    }
  }

  async getUserEvents(username: string): Promise<any[]> {
    try {
      return await this.fetchWithAuth(`${this.baseUrl}/users/${username}/events?per_page=100`)
    } catch (error) {
      console.warn('GitHub events not available:', error)
      return []
    }
  }

  // GitHub Contributionsのようなアクティビティデータを生成
  async getActivityData(username: string, days = 365) {
    try {
      const events = await this.getUserEvents(username)
      const activityMap = new Map<string, number>()

      events.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0]
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
      })

      // 過去365日のデータを生成
      const result = []
      const endDate = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        
        result.push({
          date: dateString,
          count: activityMap.get(dateString) || 0
        })
      }

      return result
    } catch (error) {
      console.warn('GitHub activity data not available:', error)
      return []
    }
  }
}

export const githubApi = new GitHubAPI()