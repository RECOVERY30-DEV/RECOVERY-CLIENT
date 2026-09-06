import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full text-primary-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary-blue-800 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-disabled-200 [&>svg]:size-full',
  {
    variants: {
      size: {
        sm: 'size-5',
        md: 'size-6',
        lg: 'size-[34px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> &
  VariantProps<typeof iconButtonVariants> & {
    'aria-label': string
  }

export function IconButton({ className, size, type = 'button', ...props }: IconButtonProps) {
  return <button className={cn(iconButtonVariants({ size }), className)} type={type} {...props} />
}
