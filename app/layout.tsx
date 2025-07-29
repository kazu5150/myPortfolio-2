import './globals.css'
import { Metadata } from 'next'
import LayoutClient from './layout-client'

export const metadata: Metadata = {
  title: 'AI Portfolio',
  description: 'AI技術を活用したポートフォリオサイト',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-black text-white">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}