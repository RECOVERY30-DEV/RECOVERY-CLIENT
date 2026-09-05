import type { CashflowDailyDetail } from '../model/cashflow-daily-detail-data'

type CashflowDailyNotesProps = Readonly<{
  notes: CashflowDailyDetail['notes']
}>

export function CashflowDailyNotes({ notes }: CashflowDailyNotesProps) {
  return (
    <section>
      <h2 className="text-[18px] leading-[21px] font-bold text-neutral-900">특이사항</h2>
      <ul className="mt-5 flex flex-col gap-5">
        {notes.map((note) => (
          <li className="rounded-[10px] bg-neutral-100 px-[14px] py-[10px]" key={note.title}>
            <h3 className="flex items-center gap-[6px] text-[14px] leading-[17px] font-medium text-primary-100">
              <span aria-hidden="true" className="flex size-6 items-center justify-center">
                <span className="size-2 rounded-[1px] bg-warning-500" />
              </span>
              {note.title}
            </h3>
            <p className="mt-[10px] text-[11px] leading-[13px] text-secondary-300">
              {note.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
