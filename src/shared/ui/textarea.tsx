import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

export type TextareaProps = ComponentProps<'textarea'>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[82px] w-full resize-y rounded-[4px] border border-transparent bg-neutral-100 px-[11px] py-[11px] typo-caption-3 text-primary-100 transition-colors placeholder:text-neutral-600 focus-visible:border-primary-blue-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-disabled-50 disabled:text-disabled-200 aria-invalid:border-error-500',
        className,
      )}
      {...props}
    />
  )
}
