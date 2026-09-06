'use client'

import Link from 'next/link'
import type { FormEvent } from 'react'

import RecoveryMark from '@/shared/assets/brand/recovery-mark.svg'
import NextCircle from '@/shared/assets/icons/next-circle.svg'
import { Button, Input, MobileScreen } from '@/shared/ui'

export function LoginScreen() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <MobileScreen aria-label="Recovery30 로그인 화면">
      <div className="px-6 pt-[156px]">
        <header className="flex flex-col items-center text-center">
          <RecoveryMark aria-hidden="true" className="h-[38px] w-[54px]" />

          <div className="mt-3">
            <h1 className="text-[16px] leading-[19px] font-semibold text-secondary-700">
              Recovery30 로그인
            </h1>
            <p className="mt-[6px] text-[12px] leading-4 font-normal text-secondary-300">
              현금흐름 위험을 분석부터 회복까지 Recovery30
            </p>
          </div>
        </header>

        <form aria-label="로그인" className="mt-[52px]" onSubmit={handleSubmit}>
          <label className="block text-[14px] leading-5 font-normal text-secondary-700">
            <span>E-mail</span>
            <Input
              aria-label="이메일"
              autoComplete="email"
              className="mt-[3px] border-transparent bg-neutral-100 text-[11px] leading-4 font-normal placeholder:text-secondary-300"
              placeholder="메일을 입력해주세요."
              required
              type="email"
            />
          </label>

          <label className="mt-[10px] block text-[14px] leading-5 font-normal text-secondary-700">
            <span>PW</span>
            <Input
              aria-label="비밀번호"
              autoComplete="current-password"
              className="mt-[3px] border-transparent bg-neutral-100 text-[11px] leading-4 font-normal placeholder:text-secondary-300"
              placeholder="비밀번호를 입력해주세요."
              required
              type="password"
            />
          </label>

          <Button className="mt-4 w-full" type="submit">
            로그인
          </Button>

          <nav aria-label="계정 도움말" className="mt-[14px] flex items-center justify-between">
            <Link
              className="inline-flex h-[34px] items-center gap-[2px] text-[14px] leading-5 font-normal text-secondary-700"
              href="/signup"
            >
              계정생성
              <NextCircle aria-hidden="true" className="size-[34px]" />
            </Link>

            <Link
              className="border-b border-b-neutral-700 text-[12px] leading-4 font-medium text-secondary-300"
              href="/account-recovery"
            >
              계정을 잃어버리셨나요?
            </Link>
          </nav>
        </form>
      </div>
    </MobileScreen>
  )
}
