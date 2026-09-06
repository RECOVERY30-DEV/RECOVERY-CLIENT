import type { ComponentProps, ReactNode } from 'react'

import { Switch } from '@/shared/ui'

type ConsentOptionProps = Readonly<{
  checked: boolean
  icon: ReactNode
  label: string
  onChange: NonNullable<ComponentProps<'input'>['onChange']>
}>

export function ConsentOption({ checked, icon, label, onChange }: ConsentOptionProps) {
  return (
    <Switch
      checked={checked}
      className="w-full"
      label={
        <span className="flex items-center gap-[6px] text-primary-200">
          <span aria-hidden="true" className="flex size-6 items-center justify-center">
            {icon}
          </span>
          {label}
        </span>
      }
      onChange={onChange}
    />
  )
}
