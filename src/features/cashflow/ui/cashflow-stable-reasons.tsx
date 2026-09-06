type CashflowStableReasonsProps = Readonly<{
  reasons: readonly string[]
}>

export function CashflowStableReasons({ reasons }: CashflowStableReasonsProps) {
  return (
    <section
      aria-labelledby="cashflow-stable-reasons-title"
      className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="cashflow-stable-reasons-title"
      >
        판단 근거
      </h2>

      <ul className="mt-5 flex flex-col gap-[14px]">
        {reasons.map((reason) => (
          <li className="text-[12px] leading-[15px] font-medium text-primary-100" key={reason}>
            {reason}
          </li>
        ))}
      </ul>
    </section>
  )
}
