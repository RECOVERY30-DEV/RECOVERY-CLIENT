import { Input, Select, Switch } from '@/shared/ui'

import {
  SUPPORT_PROGRAM_CATEGORIES,
  SUPPORT_PROGRAM_REGIONS,
  type SupportProgramCategory,
} from '../model/support-program-data'

type SupportProgramFiltersProps = Readonly<{
  isApplicationOpenOnly: boolean
  onApplicationOpenOnlyChange: (isChecked: boolean) => void
  onCategoryChange: (category: SupportProgramCategory) => void
  onRegionChange: (region: string) => void
  onSearchChange: (searchTerm: string) => void
  region: string
  searchTerm: string
  selectedCategory: SupportProgramCategory
}>

export function SupportProgramFilters({
  isApplicationOpenOnly,
  onApplicationOpenOnlyChange,
  onCategoryChange,
  onRegionChange,
  onSearchChange,
  region,
  searchTerm,
  selectedCategory,
}: SupportProgramFiltersProps): React.JSX.Element {
  return (
    <section aria-label="지원사업 필터">
      <label className="sr-only" htmlFor="support-program-search">
        지원사업 검색
      </label>
      <Input
        id="support-program-search"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="사업명·기관·지원 분야 검색"
        role="searchbox"
        value={searchTerm}
      />

      <div aria-label="지원사업 카테고리" className="mt-[10px] flex flex-wrap gap-2">
        {SUPPORT_PROGRAM_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category

          return (
            <button
              aria-pressed={isSelected}
              className={`h-9 rounded-full px-4 typo-body-8 transition-colors focus-visible:ring-2 focus-visible:ring-primary-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                isSelected
                  ? 'bg-primary-blue-100 text-primary-blue-900'
                  : 'bg-neutral-300 text-secondary-300 hover:bg-neutral-400'
              }`}
              key={category}
              onClick={() => onCategoryChange(category)}
              type="button"
            >
              {category}
            </button>
          )
        })}
      </div>

      <label className="mt-5 block typo-body-5 text-neutral-900" htmlFor="support-program-region">
        지역
      </label>
      <Select
        className="mt-[6px]"
        id="support-program-region"
        onChange={(event) => onRegionChange(event.target.value)}
        value={region}
      >
        {SUPPORT_PROGRAM_REGIONS.map((regionOption) => (
          <option key={regionOption} value={regionOption}>
            {regionOption}
          </option>
        ))}
      </Select>

      <Switch
        checked={isApplicationOpenOnly}
        className="mt-5 w-full"
        label="신청 가능만 보기"
        onChange={(event) => onApplicationOpenOnlyChange(event.target.checked)}
      />
    </section>
  )
}
