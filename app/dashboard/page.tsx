import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LearningAnalytics from "@/components/dashboard/learning-analytics"
import ProjectAnalytics from "@/components/dashboard/project-analytics"
import ActivityHeatmap from "@/components/dashboard/activity-heatmap"
import RealDataAnalytics from "@/components/dashboard/real-data-analytics"

export const metadata: Metadata = {
  title: "Dashboard | Kazuhiro Matsuzawa",
  description: "Personal analytics and activity tracking dashboard",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          学習進捗とプロジェクト活動の可視化
        </p>
      </div>

      <Tabs defaultValue="real-data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="real-data">実際のデータ</TabsTrigger>
          <TabsTrigger value="analytics">データベース分析</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
        </TabsList>

        <TabsContent value="real-data" className="space-y-4">
          <RealDataAnalytics />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>学習時間の推移</CardTitle>
                <CardDescription>
                  週単位・月単位での学習時間の可視化
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LearningAnalytics />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>プロジェクト進捗</CardTitle>
                <CardDescription>
                  各プロジェクトの進行状況
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectAnalytics />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>アクティビティヒートマップ</CardTitle>
              <CardDescription>
                プロジェクト、学習、ブログ投稿の統合アクティビティ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}