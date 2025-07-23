"use client"

import { useLearningEntries } from "@/hooks/use-learning-entries"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks, parseISO, isWithinInterval } from "date-fns"
import { ja } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"

export default function LearningAnalytics() {
  const { data: learningEntries, isLoading } = useLearningEntries()

  const weeklyData = useMemo(() => {
    if (!learningEntries) return []

    const endDate = new Date()
    const startDate = subWeeks(endDate, 11)
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate })

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart)
      const weekEntries = learningEntries.filter(entry => {
        const entryDate = parseISO(entry.date)
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd })
      })

      const totalHours = weekEntries.reduce((sum, entry) => 
        sum + (entry.completed_hours ? Number(entry.completed_hours) : 0), 0
      )

      return {
        week: format(weekStart, "M/d", { locale: ja }),
        hours: totalHours,
        entries: weekEntries.length
      }
    })
  }, [learningEntries])

  const categoryData = useMemo(() => {
    if (!learningEntries) return []

    const categoryHours: Record<string, number> = {}
    
    learningEntries.forEach(entry => {
      if (entry.categories && entry.completed_hours) {
        entry.categories.forEach(category => {
          categoryHours[category] = (categoryHours[category] || 0) + Number(entry.completed_hours)
        })
      }
    })

    return Object.entries(categoryHours).map(([category, hours]) => ({
      category,
      hours
    }))
  }, [learningEntries])

  const totalHours = useMemo(() => {
    if (!learningEntries) return 0
    return learningEntries.reduce((sum, entry) => 
      sum + (entry.completed_hours ? Number(entry.completed_hours) : 0), 0
    )
  }, [learningEntries])

  const totalEntries = learningEntries?.length || 0
  const averageHoursPerEntry = totalEntries > 0 ? (totalHours / totalEntries).toFixed(1) : 0

  if (isLoading) {
    return <div className="p-4 text-center">データを読み込み中...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総学習時間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">学習エントリー数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均時間/日</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageHoursPerEntry}h</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">週間推移</TabsTrigger>
          <TabsTrigger value="category">カテゴリ別</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="mt-4">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  fontSize={12}
                />
                <YAxis 
                  fontSize={12}
                  label={{ value: '時間', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}時間`, 
                    name === 'hours' ? '学習時間' : 'エントリー数'
                  ]}
                  labelFormatter={(label) => `週: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="category" className="mt-4">
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  fontSize={12}
                  label={{ value: '時間', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}時間`, '学習時間']}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}