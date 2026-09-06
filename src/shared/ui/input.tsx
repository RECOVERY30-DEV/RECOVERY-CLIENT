import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

export type InputProps = ComponentProps<'input'>

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-[38px] w-full rounded-[4px] border border-disabled-50 bg-base-white px-[11px] typo-body-5 text-primary-100 transition-colors placeholder:text-secondary-300 focus-visible:border-primary-blue-800 focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-disabled-200 aria-invalid:border-error-500',
        className,
      )}
      type={type}
      {...props}
    />
  )
}
