'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import RecoveryMark from '@/shared/assets/brand/recovery-mark.svg'
import RecoveryWordmark from '@/shared/assets/brand/recovery-wordmark.svg'
import { MobileScreen } from '@/shared/ui'

const SPLASH_DURATION_MS = 1500

export function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.replace('/login')
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(redirectTimer)
  }, [router])

  return (
    <MobileScreen aria-label="Recovery30 시작 화면">
      <div className="absolute top-[352px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[8px]">
        <RecoveryMark aria-hidden="true" className="h-[66px] w-[94px]" />
        <RecoveryWordmark aria-label="Recovery30" className="h-[29px] w-[150px]" role="img" />
      </div>
    </MobileScreen>
  )
}
