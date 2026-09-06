import { Input, Switch } from '@/shared/ui'

type SupportProgramFiltersProps = Readonly<{
  isApplicationOpenOnly: boolean
  onApplicationOpenOnlyChange: (isChecked: boolean) => void
  onSearchChange: (searchTerm: string) => void
  searchTerm: string
}>

export function SupportProgramFilters({
  isApplicationOpenOnly,
  onApplicationOpenOnlyChange,
  onSearchChange,
  searchTerm,
}: SupportProgramFiltersProps): React.JSX.Element {
  return (
    <section aria-label="지원사업 필터">
      <label className="sr-only" htmlFor="support-program-search">
        지원사업 검색
      </label>
      <Input
        className="focus-visible:border-primary-blue-800"
        id="support-program-search"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="사업명·기관·지원 분야 검색"
        role="searchbox"
        value={searchTerm}
      />

      <Switch
        checked={isApplicationOpenOnly}
        className="mt-[10px] w-full"
        label="신청 가능만 보기"
        onChange={(event) => onApplicationOpenOnlyChange(event.target.checked)}
      />
    </section>
  )
}
