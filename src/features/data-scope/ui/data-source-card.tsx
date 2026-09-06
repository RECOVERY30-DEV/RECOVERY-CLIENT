import Image from 'next/image'

import AutomaticIcon from '@/features/data-scope/assets/data-automatic.svg'
import CardIcon from '@/features/data-scope/assets/data-card.svg'
import PassbookIcon from '@/features/data-scope/assets/data-passbook.svg'
import KbBankLogo from '@/features/data-scope/assets/kb-bank.png'
import ShinhanBankLogo from '@/features/data-scope/assets/shinhan-bank.png'
import type { DataSourceKind, DataSourceStatus } from '@/features/data-scope/model/data-scope-data'

function DataSourceIcon({ kind }: Readonly<{ kind: DataSourceKind }>) {
  if (kind === 'account') {
    return (
      <span
        aria-hidden="true"
        className="flex size-6 flex-col justify-center gap-[2px] rounded-sm px-0.5"
      >
        <span className="h-0.5 rounded-full bg-primary-blue-100" />
        <span className="h-[6px] rounded-sm bg-primary-blue-100" />
        <span className="h-0.5 rounded-full bg-primary-blue-100" />
      </span>
    )
  }

  const Icon = kind === 'card' ? CardIcon : kind === 'loan' ? PassbookIcon : AutomaticIcon

  return <Icon aria-hidden="true" className="size-6" />
}

function BankLogos() {
  return (
    <span aria-hidden="true" className="flex shrink-0 -space-x-1">
      <span className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-[#ffcf33]">
        <Image
          alt=""
          className="h-[11px] w-[21px] max-w-none"
          height={11}
          src={KbBankLogo}
          width={21}
        />
      </span>
      <span className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-base-white">
        <Image
          alt=""
          className="size-4 object-cover"
          height={16}
          src={ShinhanBankLogo}
          width={16}
        />
      </span>
    </span>
  )
}

export function DataSourceCard({
  description,
  kind,
  reflectedRange,
  refreshedAt,
  title,
  warning,
}: DataSourceStatus) {
  return (
    <article className="rounded-[10px] bg-neutral-100 px-[14px] py-[10px]">
      <div className="flex items-center gap-[6px]">
        <DataSourceIcon kind={kind} />
        <h3 className="text-[14px] leading-[17px] font-medium text-primary-100">{title}</h3>
      </div>

      <div className="mt-1 flex items-center gap-[5px]">
        {kind === 'account' ? <BankLogos /> : null}
        <p className="text-[11px] leading-[13px] text-secondary-300">{description}</p>
      </div>

      <dl className="mt-[15px] flex flex-col gap-[5px] text-[12px] leading-[14px] text-secondary-300">
        <div className="flex justify-between gap-4">
          <dt>마지막 갱신</dt>
          <dd className="font-medium">{refreshedAt}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>반영 기간</dt>
          <dd className="font-medium">{reflectedRange}</dd>
        </div>
      </dl>

      {warning ? (
        <p className="mt-[15px] text-[11px] leading-[13px] text-secondary-300">{warning}</p>
      ) : null}
    </article>
  )
}
