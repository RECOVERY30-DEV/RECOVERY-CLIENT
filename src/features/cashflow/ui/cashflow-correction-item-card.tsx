import Link from 'next/link'

import type { CashflowCorrectionItem } from '../model/cashflow-correction-data'

type CashflowCorrectionItemCardProps = Readonly<{
  item: CashflowCorrectionItem
}>

export function CashflowCorrectionItemCard({ item }: CashflowCorrectionItemCardProps) {
  return (
    <li>
      <Link
        aria-label={`${item.title} 입력하기`}
        className="block rounded-[10px] bg-neutral-100 px-[14px] py-5 transition-colors hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none"
        href={item.href}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[16px] leading-6 font-semibold text-neutral-900">{item.title}</h3>
          <span className="shrink-0 text-[12px] leading-[14px] font-semibold text-secondary-500">
            {item.status}
          </span>
        </div>
        <p className="mt-2 text-[12px] leading-[15px] text-secondary-300">{item.description}</p>
      </Link>
    </li>
  )
}
