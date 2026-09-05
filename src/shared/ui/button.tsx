import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-secondary-700 text-base-white hover:bg-secondary-400 active:bg-secondary-600 disabled:bg-disabled-50 disabled:text-base-white',
        secondary:
          'bg-neutral-400 text-primary-blue-900 hover:text-primary-blue-700 active:ring-1 active:ring-primary-blue-500 disabled:text-disabled-200',
        outline:
          'border border-primary-blue-900 bg-base-white text-primary-blue-900 hover:border-primary-blue-700 hover:text-primary-blue-700 active:border-primary-blue-400 active:text-primary-blue-400 disabled:border-disabled-50 disabled:text-disabled-50',
        text: 'border-b border-b-neutral-700 text-neutral-700 hover:border-b-secondary-400 hover:text-secondary-400 active:border-b-secondary-300 active:text-secondary-300 disabled:border-b-disabled-200 disabled:text-disabled-200',
      },
      size: {
        lg: 'h-[42px] rounded-[8px] px-[22px] py-[8px] typo-body-3',
        md: 'h-9 rounded-[6px] px-4 py-[6px] typo-body-5',
        sm: 'h-[30px] rounded-[6px] px-[10px] py-1 typo-body-8',
      },
    },
    defaultVariants: {
      size: 'lg',
      variant: 'primary',
    },
  },
)

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants>

export function Button({ className, size, type = 'button', variant, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ size, variant }), className)} type={type} {...props} />
  )
}
