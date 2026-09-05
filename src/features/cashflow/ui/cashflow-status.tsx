export function CashflowStatus() {
  return (
    <section aria-labelledby="cashflow-status-title" className="h-[210px]">
      <h2
        className="text-[18px] leading-[21px] font-bold text-primary-200"
        id="cashflow-status-title"
      >
        현재 상태
      </h2>

      <div className="mt-5 h-[169px] rounded-[10px] border border-disabled-50 bg-neutral-100 px-[14px] py-5">
        <div className="flex h-[22px] items-center justify-between">
          <strong className="inline-flex h-[22px] items-center rounded-[4px] bg-[#ffd4d5] px-[11px] text-[11px] leading-[13px] font-semibold text-error-500">
            위험상태
          </strong>
          <p className="text-[12px] leading-[14px] font-medium text-neutral-900">
            부족일까지 18일 남았습니다.
          </p>
        </div>
        <p className="mt-[15px] text-[12px] leading-[14px] text-neutral-900">
          분석 데이터 범위가 낮으면
          <br />
          판단 보류 상태로 전환될 수 있습니다.
        </p>
        <button
          className="mt-5 flex h-[42px] items-center justify-center rounded-[8px] bg-neutral-400 text-[14px] leading-[20px] font-medium text-primary-blue-800"
          disabled
          type="button"
        >
          누락 정보 보정하기
        </button>
      </div>
    </section>
  )
}
