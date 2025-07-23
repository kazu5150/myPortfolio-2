"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
// Remove direct API imports - we'll use API routes instead
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { format, subDays, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { RefreshCw, Clock, Code, GitCommit } from "lucide-react"

interface GitHubData {
  repos: any[]
  commits: any[]
  languages: Record<string, number>
  activity: Array<{ date: string; count: number }>
}

interface WakaTimeData {
  dailyHours: Array<{ date: string; hours: number; languages: any[]; projects: any[] }>
  languageStats: any[]
  projectStats: any[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

export default function RealDataAnalytics() {
  const [githubData, setGithubData] = useState<GitHubData | null>(null)
  const [wakaTimeData, setWakaTimeData] = useState<WakaTimeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // GitHub username is handled server-side now

  const fetchGitHubData = async () => {
    try {
      const response = await fetch('/api/github/stats')
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      return {
        repos: data.recentRepos || [],
        commits: [], // Will be included in totalCommits
        languages: data.languageStats || {},
        activity: data.activity || [],
        totalRepos: data.totalRepos || 0,
        totalCommits: data.totalCommits || 0
      }
    } catch (err) {
      console.error('Failed to fetch GitHub data:', err)
      return null
    }
  }

  const fetchWakaTimeData = async () => {
    try {
      // Fetch summaries for daily hours
      const summariesResponse = await fetch('/api/wakatime/stats?endpoint=summaries')
      const summariesData = summariesResponse.ok ? await summariesResponse.json() : null
      
      // Fetch stats for language and project data
      const statsResponse = await fetch('/api/wakatime/stats?range=last_30_days')
      const statsData = statsResponse.ok ? await statsResponse.json() : null

      if (!summariesData || !statsData) {
        console.error('Failed to fetch WakaTime data')
        return null
      }

      return {
        dailyHours: summariesData.dailyHours || [],
        languageStats: statsData.languageStats || [],
        projectStats: statsData.projectStats || []
      }
    } catch (err) {
      console.error('Failed to fetch WakaTime data:', err)
      return null
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [github, wakatime] = await Promise.all([
        fetchGitHubData(),
        fetchWakaTimeData()
      ])

      setGithubData(github)
      setWakaTimeData(wakatime)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Process data for charts
  const chartData = useMemo(() => {
    if (!githubData && !wakaTimeData) return null

    // Daily coding activity (combine GitHub commits and WakaTime hours)
    const dailyActivity = []
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateString = format(date, 'yyyy-MM-dd')
      
      const githubCount = githubData?.activity.find(a => a.date === dateString)?.count || 0
      const wakaTimeHours = wakaTimeData?.dailyHours.find(d => d.date === dateString)?.hours || 0
      
      return {
        date: format(date, 'M/d', { locale: ja }),
        fullDate: dateString,
        commits: githubCount,
        hours: wakaTimeHours,
        activity: githubCount + wakaTimeHours
      }
    })

    // Language usage (combine GitHub and WakaTime)
    const languageData = []
    if (githubData?.languages) {
      Object.entries(githubData.languages).forEach(([lang, bytes]) => {
        const wakaTimeLang = wakaTimeData?.languageStats.find(l => l.name === lang)
        languageData.push({
          language: lang,
          githubBytes: bytes,
          wakaTimeHours: wakaTimeLang?.hours || 0,
          wakaTimePercent: wakaTimeLang?.percent || 0
        })
      })
    }

    return {
      dailyActivity: last30Days,
      languageData: languageData.slice(0, 8) // Top 8 languages
    }
  }, [githubData, wakaTimeData])

  const stats = useMemo(() => {
    if (!githubData && !wakaTimeData) return null

    const totalRepos = githubData?.totalRepos || githubData?.repos.length || 0
    const totalCommits = githubData?.totalCommits || githubData?.commits.length || 0
    const totalCodingHours = wakaTimeData?.dailyHours.reduce((sum, day) => sum + day.hours, 0) || 0
    const avgDailyHours = totalCodingHours / 30

    return {
      totalRepos,
      totalCommits,
      totalCodingHours: totalCodingHours.toFixed(1),
      avgDailyHours: avgDailyHours.toFixed(1)
    }
  }, [githubData, wakaTimeData])

  // Always show the component, but display configuration message when needed
  // Remove this check since we want to always show the component
  // const showConfigMessage = !process.env.NEXT_PUBLIC_GITHUB_USERNAME && !process.env.NEXT_PUBLIC_GITHUB_TOKEN

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6" />
            実際のデータ分析
          </h2>
          <p className="text-muted-foreground">
            GitHub と WakaTime からの実際の開発活動データ
          </p>
        </div>
        <Button onClick={fetchAllData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">エラー: {error}</p>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>デバッグ情報:</p>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {JSON.stringify({
                  githubDataStatus: githubData ? 'loaded' : 'null',
                  wakaTimeDataStatus: wakaTimeData ? 'loaded' : 'null',
                  error: error,
                  // Environment variables are not accessible in client components
                  note: 'Environment variables are configured on server side'
                }, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">リポジトリ</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalRepos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">コミット (30日)</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalCommits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">総コーディング時間</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalCodingHours}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">平均 (日)</span>
              </div>
              <div className="text-2xl font-bold">{stats.avgDailyHours}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">日別アクティビティ</TabsTrigger>
          <TabsTrigger value="languages">言語使用状況</TabsTrigger>
          <TabsTrigger value="projects">プロジェクト</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>過去30日の開発アクティビティ</CardTitle>
              <CardDescription>
                GitHub のコミット数と WakaTime のコーディング時間
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData?.dailyActivity && (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(label) => `日付: ${label}`}
                        formatter={(value, name) => [
                          value,
                          name === 'commits' ? 'コミット数' : 'コーディング時間(h)'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="commits" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="commits"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="hours"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>プログラミング言語使用状況</CardTitle>
              <CardDescription>
                GitHub のコード量と WakaTime の使用時間
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData?.languageData && chartData.languageData.length > 0 && (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData.languageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="language" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar 
                        dataKey="wakaTimeHours" 
                        fill="#10b981"
                        name="使用時間(h)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>最近のプロジェクト</CardTitle>
              <CardDescription>
                GitHub リポジトリと WakaTime プロジェクト
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {githubData?.repos.slice(0, 5).map((repo) => (
                  <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{repo.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {repo.language || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                        <span>更新: {format(parseISO(repo.updated_at), 'M/d', { locale: ja })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}