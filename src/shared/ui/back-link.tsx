import Link from 'next/link'

import BackIcon from '@/shared/assets/icons/back.svg'

type BackLinkProps = Readonly<{
  href: string
  label: string
}>

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      aria-label={label}
      className="absolute top-[61px] left-[11px] z-20 flex size-6 items-center justify-center"
      href={href}
    >
      <BackIcon aria-hidden="true" className="size-6" />
    </Link>
  )
}
