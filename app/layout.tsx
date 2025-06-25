import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Matsuzawa - AI Software Engineer',
  description: '副業から本業へ転身する開発者の成長記録。AIとテクノロジーで未来を築く。',
  keywords: 'AI, Software Engineer, Portfolio, 松澤, Matsuzawa',
  authors: [{ name: 'Kazuhiro Matsuzawa' }],
  creator: 'Kazuhiro Matsuzawa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-white">
        <Sidebar />
        <main className="lg:ml-[280px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
