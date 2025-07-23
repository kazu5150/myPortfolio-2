"use client"

import { useProjects } from "@/hooks/use-projects"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useMemo } from "react"

const STATUS_COLORS = {
  'PLANNING': '#6366f1',
  'IN_PROGRESS': '#f59e0b',
  'TESTING': '#8b5cf6',
  'COMPLETED': '#10b981',
  'PAUSED': '#6b7280'
}

const CATEGORY_COLORS = {
  'WEB': '#3b82f6',
  'MOBILE': '#10b981',
  'AI': '#f59e0b',
  'GAME': '#ef4444',
  'TOOL': '#8b5cf6',
  'OTHER': '#6b7280'
}

export default function ProjectAnalytics() {
  const { data: projects, isLoading } = useProjects()

  const statusData = useMemo(() => {
    if (!projects) return []

    const statusCount: Record<string, number> = {}
    projects.forEach(project => {
      statusCount[project.status] = (statusCount[project.status] || 0) + 1
    })

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    }))
  }, [projects])

  const categoryData = useMemo(() => {
    if (!projects) return []

    const categoryCount: Record<string, number> = {}
    projects.forEach(project => {
      categoryCount[project.category] = (categoryCount[project.category] || 0) + 1
    })

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
    }))
  }, [projects])

  const inProgressProjects = useMemo(() => {
    if (!projects) return []
    return projects
      .filter(p => p.status === 'IN_PROGRESS')
      .slice(0, 5)
  }, [projects])

  const completedCount = projects?.filter(p => p.status === 'COMPLETED').length || 0
  const totalProjects = projects?.length || 0
  const completionRate = totalProjects > 0 ? (completedCount / totalProjects * 100) : 0

  if (isLoading) {
    return <div className="p-4 text-center">データを読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount}/{totalProjects} プロジェクト完了
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ステータス別分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">カテゴリ別分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 150 }}>
              <ResponsiveContainer>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="category" fontSize={10} width={60} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {inProgressProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">進行中のプロジェクト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{project.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {project.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}