import type { ComponentProps } from 'react'

import ChevronDownIcon from '@/shared/assets/icons/chevron-down.svg'
import { cn } from '@/shared/lib'

type SelectProps = ComponentProps<'select'> & {
  placeholder?: string
  wrapperClassName?: string
}

function Select({ children, className, placeholder, wrapperClassName, ...props }: SelectProps) {
  return (
    <span className={cn('relative inline-block w-full', wrapperClassName)}>
      <select
        {...props}
        className={cn(
          'peer h-9 w-full appearance-none rounded border border-field bg-base-white px-3 pr-9 typo-body-5 text-primary-100 transition-colors outline-none',
          'focus:border-primary-blue-800 focus:ring-2 focus:ring-primary-blue-800',
          'disabled:cursor-not-allowed disabled:bg-neutral-400 disabled:text-disabled-200',
          'aria-invalid:border-error-500 aria-invalid:focus:ring-error-500/20',
          className,
        )}
      >
        {placeholder ? (
          <option disabled value="">
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 peer-disabled:opacity-50"
      />
    </span>
  )
}

export { Select }
export type { SelectProps }
