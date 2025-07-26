"use client"

import { useProjects } from "@/hooks/use-projects"
import { useLearningEntries } from "@/hooks/use-learning-entries"
import { usePosts } from "@/hooks/use-posts"
import { format, eachDayOfInterval, subDays, parseISO, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useMemo } from "react"

interface ActivityDay {
  date: Date
  dateString: string
  activities: {
    projects: number
    learning: number
    posts: number
    total: number
  }
}

export default function ActivityHeatmap() {
  const { data: projects } = useProjects()
  const { data: learningEntries } = useLearningEntries()
  const { data: posts } = usePosts()

  const heatmapData = useMemo(() => {
    const endDate = new Date()
    const startDate = subDays(endDate, 364) // 1年分
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map(date => {
      const dateString = format(date, 'yyyy-MM-dd')
      
      // プロジェクト活動
      const projectActivities = projects?.filter(project => {
        const createdDate = parseISO(project.created_at)
        const updatedDate = parseISO(project.updated_at)
        return isSameDay(createdDate, date) || isSameDay(updatedDate, date)
      }).length || 0

      // 学習活動
      const learningActivities = learningEntries?.filter(entry => {
        const entryDate = parseISO(entry.date)
        return isSameDay(entryDate, date)
      }).length || 0

      // ブログ投稿活動
      const postActivities = posts?.filter(post => {
        const createdDate = parseISO(post.created_at)
        const updatedDate = parseISO(post.updated_at)
        return isSameDay(createdDate, date) || isSameDay(updatedDate, date)
      }).length || 0

      const total = projectActivities + learningActivities + postActivities

      return {
        date,
        dateString,
        activities: {
          projects: projectActivities,
          learning: learningActivities,
          posts: postActivities,
          total
        }
      }
    })
  }, [projects, learningEntries, posts])

  const getIntensityClass = (total: number) => {
    if (total === 0) return "bg-gray-100 dark:bg-gray-800"
    if (total === 1) return "bg-green-200 dark:bg-green-900"
    if (total === 2) return "bg-green-400 dark:bg-green-700"
    if (total >= 3) return "bg-green-600 dark:bg-green-500"
    return "bg-gray-100 dark:bg-gray-800"
  }

  const weeks = useMemo(() => {
    const weeksArray: ActivityDay[][] = []
    let currentWeek: ActivityDay[] = []

    heatmapData.forEach((day, index) => {
      if (index > 0 && day.date.getDay() === 0) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    })

    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek)
    }

    return weeksArray
  }, [heatmapData])

  const totalActivities = heatmapData.reduce((sum, day) => sum + day.activities.total, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          過去1年間の活動: {totalActivities} アクティビティ
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>少ない</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-sm"></div>
          </div>
          <span>多い</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-fit">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => (
                <TooltipProvider key={day.dateString}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-3 h-3 rounded-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 ${getIntensityClass(day.activities.total)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <div className="font-medium">
                          {format(day.date, 'M月d日（E）', { locale: ja })}
                        </div>
                        <div className="space-y-1">
                          {day.activities.total === 0 ? (
                            <p className="text-sm text-muted-foreground">活動なし</p>
                          ) : (
                            <>
                              {day.activities.projects > 0 && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">プロジェクト</Badge>
                                  <span className="text-sm">{day.activities.projects}</span>
                                </div>
                              )}
                              {day.activities.learning > 0 && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">学習</Badge>
                                  <span className="text-sm">{day.activities.learning}</span>
                                </div>
                              )}
                              {day.activities.posts > 0 && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">ブログ</Badge>
                                  <span className="text-sm">{day.activities.posts}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {heatmapData.filter(d => d.activities.projects > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">プロジェクト活動日</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {heatmapData.filter(d => d.activities.learning > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">学習日</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {heatmapData.filter(d => d.activities.posts > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">ブログ投稿日</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}