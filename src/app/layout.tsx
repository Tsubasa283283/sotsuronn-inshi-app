import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { AppProvider } from '@/lib/AppContext'

export const metadata: Metadata = {
  title: '卒論・院試管理システム',
  description: '卒論管理と院試対策を一元管理するローカルアプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-slate-50">
        <AppProvider>
          <Sidebar />
          <main className="ml-[220px] min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}
