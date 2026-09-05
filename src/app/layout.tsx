import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { QueryProvider } from '@/app/providers'
import { pretendard } from '@/shared/config'

import '@/styles/global.css'

export const metadata: Metadata = {
  title: 'RECOVERY-CLIENT',
  description: 'RECOVERY30 클라이언트',
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={pretendard.variable} lang="ko">
      <body className={pretendard.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
