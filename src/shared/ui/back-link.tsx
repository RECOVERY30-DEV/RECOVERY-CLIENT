'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'

import BackIcon from '@/shared/assets/icons/back.svg'

type BackLinkProps = Readonly<{
  href: string
  label: string
}>

export function BackLink({ href, label }: BackLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      window.history.length <= 1
    ) {
      return
    }

    event.preventDefault()
    window.history.back()
  }

  return (
    <Link
      aria-label={label}
      className="absolute top-[61px] left-[11px] z-20 flex size-6 items-center justify-center"
      href={href}
      onClick={handleClick}
    >
      <BackIcon aria-hidden="true" className="size-6" />
    </Link>
  )
}
