import type { ReactNode } from 'react'

type ConsentSectionProps = Readonly<{
  children: ReactNode
  description: string
  footnote: string
  title: string
}>

export function ConsentSection({ children, description, footnote, title }: ConsentSectionProps) {
  return (
    <section>
      <h2 className="text-[18px] leading-[21px] font-bold text-primary-200">{title}</h2>
      <div className="mt-5">{children}</div>
      <div className="mt-5 rounded-[10px] bg-neutral-100 px-[14px] py-[10px] text-secondary-300">
        <p className="text-[13px] leading-4">{description}</p>
        <p className="mt-[15px] text-[11px] leading-[13px]">{footnote}</p>
      </div>
    </section>
  )
}
