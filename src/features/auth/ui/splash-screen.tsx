'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import RecoveryMark from '@/shared/assets/brand/recovery-mark.svg'
import RecoveryWordmark from '@/shared/assets/brand/recovery-wordmark.svg'
import { MobileScreen } from '@/shared/ui'

const SPLASH_DURATION_MS = 1500

export function SplashScreen() {
  const router = useRouter()
  const hasRedirected = useRef(false)

  const redirectToLogin = useCallback(() => {
    if (hasRedirected.current) {
      return
    }

    hasRedirected.current = true
    router.replace('/login')
  }, [router])

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      redirectToLogin()
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(redirectTimer)
  }, [redirectToLogin])

  return (
    <MobileScreen aria-label="Recovery30 시작 화면">
      <button
        aria-label="로그인 화면으로 이동"
        className="absolute inset-0 z-20 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none focus-visible:ring-inset"
        onClick={redirectToLogin}
        type="button"
      />
      <div className="pointer-events-none absolute top-[352px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[8px]">
        <RecoveryMark aria-hidden="true" className="h-[66px] w-[94px]" />
        <RecoveryWordmark aria-label="Recovery30" className="h-[29px] w-[150px]" role="img" />
      </div>
    </MobileScreen>
  )
}
