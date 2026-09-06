import { useId, type ComponentProps, type ReactNode } from 'react'

import SwitchOffIcon from '@/shared/assets/icons/switch-off.svg'
import SwitchOnIcon from '@/shared/assets/icons/switch-on.svg'
import { cn } from '@/shared/lib'

type SwitchProps = Omit<ComponentProps<'input'>, 'className' | 'role' | 'type'> & {
  className?: string
  label: ReactNode
}

function Switch({ className, disabled, id, label, ...props }: SwitchProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <span
      className={cn(
        'inline-flex items-center justify-between gap-3 text-primary-100',
        'has-[:disabled]:opacity-50',
        className,
      )}
    >
      <label
        className={cn('typo-body-5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        htmlFor={inputId}
      >
        {label}
      </label>
      <span className="relative h-[23px] w-10 shrink-0 rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-blue-800 has-[:focus-visible]:ring-offset-2">
        <input
          {...props}
          className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed"
          disabled={disabled}
          id={inputId}
          role="switch"
          type="checkbox"
        />
        <span className="block h-[23px] w-10 peer-checked:hidden">
          <SwitchOffIcon aria-hidden="true" className="pointer-events-none h-[23px] w-10" />
        </span>
        <span className="hidden h-[23px] w-10 peer-checked:block">
          <SwitchOnIcon aria-hidden="true" className="pointer-events-none h-[23px] w-10" />
        </span>
      </span>
    </span>
  )
}

export { Switch }
export type { SwitchProps }
