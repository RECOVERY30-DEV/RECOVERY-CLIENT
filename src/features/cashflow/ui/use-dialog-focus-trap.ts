'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type UseDialogFocusTrapProps = Readonly<{
  onClose: () => void
}>

export function useDialogFocusTrap({ onClose }: UseDialogFocusTrapProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    getFocusableElements(dialogRef.current)[0]?.focus()
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = getFocusableElements(dialogRef.current)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (!firstElement || !lastElement) {
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  return { dialogRef, handleKeyDown }
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}
