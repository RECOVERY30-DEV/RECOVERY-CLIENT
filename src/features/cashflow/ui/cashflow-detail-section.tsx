import type { CashflowDetailSection as CashflowDetailSectionData } from '../model/cashflow-daily-detail-data'

type CashflowDetailSectionProps = Readonly<{
  section: CashflowDetailSectionData
}>

export function CashflowDetailSection({ section }: CashflowDetailSectionProps) {
  return (
    <section className="rounded-[10px] bg-neutral-100 px-[14px] py-5">
      <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">{section.title}</h2>

      <ul className="mt-5 flex flex-col gap-2">
        {section.items.map((item) => (
          <li className="flex min-h-8 items-end justify-between gap-4" key={item.label}>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] leading-[14px] font-medium text-primary-100">
                {item.label}
              </p>
              <p className="mt-1 text-[12px] leading-[14px] text-primary-100">{item.description}</p>
            </div>
            <p className="w-[155px] shrink-0 text-right text-[12px] leading-[14px] font-semibold text-primary-blue-700">
              {item.amount}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
