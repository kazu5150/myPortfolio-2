interface WakaTimeStats {
  data: {
    total_seconds: number
    total_seconds_including_other_language: number
    timeout: number
    writes_only: number
    holidays: number
    days_including_holidays: number
    days_minus_holidays: number
    status: string
    percent_calculated: number
    is_already_updating: boolean
    is_cached: boolean
    is_stuck: boolean
    is_up_to_date: boolean
    is_up_to_date_pending_future: boolean
    range: {
      start: string
      end: string
      start_date: string
      end_date: string
      start_text: string
      end_text: string
      timezone: string
    }
    languages: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    editors: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    categories: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    projects: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
  }
}

interface WakaTimeSummary {
  data: Array<{
    categories: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    languages: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    projects: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    editors: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    grand_total: {
      hours: number
      minutes: number
      total_seconds: number
      digital: string
      text: string
    }
    range: {
      start: string
      end: string
      date: string
      text: string
      timezone: string
    }
  }>
}

export class WakaTimeAPI {
  private baseUrl = 'https://wakatime.com/api/v1'
  private apiKey: string | null

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_WAKATIME_API_KEY || null
  }

  private async fetchWithAuth(url: string) {
    if (!this.apiKey) {
      console.warn('WakaTime API key not configured')
      return null
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WakaTime API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getStats(range: string = 'last_7_days'): Promise<WakaTimeStats | null> {
    try {
      return await this.fetchWithAuth(`${this.baseUrl}/users/current/stats/${range}`)
    } catch (error) {
      console.warn('WakaTime stats not available:', error)
      return null
    }
  }

  async getSummaries(start: string, end: string): Promise<WakaTimeSummary | null> {
    try {
      return await this.fetchWithAuth(`${this.baseUrl}/users/current/summaries?start=${start}&end=${end}`)
    } catch (error) {
      console.warn('WakaTime summaries not available:', error)
      return null
    }
  }

  // 過去N日間の日別コーディング時間を取得
  async getDailyCodingHours(days: number = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - days)

      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]

      const summaries = await this.getSummaries(start, end)
      
      if (!summaries?.data) return []

      return summaries.data.map(day => ({
        date: day.range.date,
        hours: day.grand_total.hours + (day.grand_total.minutes / 60),
        total_seconds: day.grand_total.total_seconds,
        languages: day.languages,
        projects: day.projects
      }))
    } catch (error) {
      console.warn('WakaTime daily hours not available:', error)
      return []
    }
  }

  // 言語別の使用時間統計
  async getLanguageStats(range: string = 'last_30_days') {
    try {
      const stats = await this.getStats(range)
      return stats?.data.languages || []
    } catch (error) {
      console.warn('WakaTime language stats not available:', error)
      return []
    }
  }

  // プロジェクト別の使用時間統計
  async getProjectStats(range: string = 'last_30_days') {
    try {
      const stats = await this.getStats(range)
      return stats?.data.projects || []
    } catch (error) {
      console.warn('WakaTime project stats not available:', error)
      return []
    }
  }
}

export const wakaTimeApi = new WakaTimeAPI()