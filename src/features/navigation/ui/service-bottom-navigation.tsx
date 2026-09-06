import Link from 'next/link'

import CashflowIcon from '@/features/navigation/assets/nav-cashflow.svg'
import HomeIcon from '@/features/navigation/assets/nav-home.svg'
import ManageIcon from '@/features/navigation/assets/nav-manage.svg'
import RecoveryIcon from '@/features/navigation/assets/nav-recovery.svg'
import { cn } from '@/shared/lib'

type NavigationItem = 'home' | 'cashflow' | 'recovery' | 'manage'

type ServiceBottomNavigationProps = Readonly<{
  activeItem: NavigationItem
  className?: string
}>

const NAVIGATION_ITEMS = [
  { href: '/home', icon: HomeIcon, id: 'home', label: '홈' },
  { href: '/cashflow', icon: CashflowIcon, id: 'cashflow', label: '현금흐름' },
  { href: '/recovery/compare', icon: RecoveryIcon, id: 'recovery', label: '회복안' },
  { href: '/consents', icon: ManageIcon, id: 'manage', label: '관리' },
] as const satisfies ReadonlyArray<{
  href: string
  id: NavigationItem
  label: string
  icon: typeof HomeIcon
}>

export function ServiceBottomNavigation({ activeItem, className }: ServiceBottomNavigationProps) {
  return (
    <nav
      aria-label="주요 메뉴"
      className={cn(
        'h-[84px] w-full bg-base-white px-4 pt-[5px] pb-[10px] sm:px-[35px]',
        className,
      )}
    >
      <ul className="flex items-center justify-between">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = item.id === activeItem
          const Icon = item.icon

          return (
            <li key={item.id}>
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex size-12 flex-col items-center justify-center gap-[3px] text-[10px] leading-3 tracking-[-0.3px]',
                  isActive ? 'text-primary-blue-500' : 'text-[#656f7b]',
                )}
                href={item.href}
              >
                <span className="flex h-6 w-6 items-center justify-center">
                  <Icon aria-hidden="true" className="max-h-6 max-w-6 text-current" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
