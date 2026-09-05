import type { ReactNode } from 'react'

import StatusBattery from '@/shared/assets/icons/status-battery.svg'
import StatusCellular from '@/shared/assets/icons/status-cellular.svg'
import StatusWifi from '@/shared/assets/icons/status-wifi.svg'
import { cn } from '@/shared/lib'

type MobileScreenProps = Readonly<{
  'aria-label': string
  children: ReactNode
  className?: string
}>

function StatusBar() {
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-1/2 z-10 h-[46px] w-full max-w-[390px] -translate-x-1/2 text-primary-100"
    >
      <span className="absolute top-[9px] left-[26px] w-[55px] text-center text-[16px] leading-[22px] font-semibold tracking-[-0.3px]">
        9:23
      </span>

      <div className="absolute top-[19px] right-[26px] flex items-center gap-[6px]">
        <StatusCellular className="h-[12px] w-[20px]" />
        <StatusWifi className="h-[12px] w-[17px]" />
        <StatusBattery className="h-[13px] w-[27px]" />
      </div>
    </div>
  )
}

export function MobileScreen({ 'aria-label': ariaLabel, children, className }: MobileScreenProps) {
  return (
    <main
      aria-label={ariaLabel}
      className="min-h-dvh bg-primary-100 sm:flex sm:items-center sm:justify-center sm:p-3"
    >
      <section
        className={cn(
          'relative min-h-dvh w-full overflow-hidden bg-base-white sm:h-[844px] sm:!min-h-[844px] sm:max-w-[390px] sm:flex-none sm:rounded-[25px] sm:shadow-[0_4px_16px_rgba(0,0,0,0.08)]',
          className,
        )}
      >
        <StatusBar />
        {children}
      </section>
    </main>
  )
}
