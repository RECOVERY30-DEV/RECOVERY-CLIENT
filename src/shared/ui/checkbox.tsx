'use client'

import { useId, useState, type ComponentProps, type ReactNode } from 'react'

import CheckedIcon from '@/shared/assets/icons/checkbox-checked.svg'
import UncheckedIcon from '@/shared/assets/icons/checkbox-unchecked.svg'
import { cn } from '@/shared/lib'

type CheckboxProps = Omit<ComponentProps<'input'>, 'className' | 'type'> & {
  className?: string
  description?: ReactNode
  label: ReactNode
}

function Checkbox({
  'aria-describedby': externalDescriptionId,
  className,
  checked,
  defaultChecked,
  description,
  disabled,
  id,
  label,
  onChange,
  ...props
}: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = description ? `${inputId}-description` : undefined
  const describedBy = [externalDescriptionId, descriptionId].filter(Boolean).join(' ') || undefined
  const [uncontrolledChecked, setUncontrolledChecked] = useState(Boolean(defaultChecked))
  const isControlled = checked !== undefined
  const isChecked = checked ?? uncontrolledChecked

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!isControlled) {
      setUncontrolledChecked(event.currentTarget.checked)
    }
    onChange?.(event)
  }

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg bg-neutral-400 px-3.5 py-2.5 text-primary-100 transition-opacity',
        'has-[:disabled]:opacity-50',
        className,
      )}
    >
      <span className="min-w-0">
        <label
          className={cn('block typo-body-5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
          htmlFor={inputId}
        >
          {label}
        </label>
        {description ? (
          <span className="mt-0.5 block typo-caption-2 text-secondary-300" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>

      <span className="relative size-6 shrink-0 rounded-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-blue-800 has-[:focus-visible]:ring-offset-2">
        <input
          {...props}
          aria-describedby={describedBy}
          className="peer absolute inset-0 z-10 size-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed"
          checked={checked}
          disabled={disabled}
          defaultChecked={isControlled ? undefined : defaultChecked}
          id={inputId}
          onChange={handleChange}
          type="checkbox"
        />
        {isChecked ? (
          <CheckedIcon aria-hidden="true" className="pointer-events-none absolute inset-0 size-6" />
        ) : (
          <UncheckedIcon
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-6"
          />
        )}
      </span>
    </div>
  )
}

export { Checkbox }
export type { CheckboxProps }
