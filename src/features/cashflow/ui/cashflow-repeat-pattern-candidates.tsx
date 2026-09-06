'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/ui'

import { CASHFLOW_REPEAT_PATTERN_CANDIDATES } from '../model/cashflow-correction-data'

type CandidateDecision = 'confirmed' | 'not-applicable' | null

const DECISION_LABELS = {
  confirmed: '확인됨',
  'not-applicable': '해당 없음',
} as const

export function CashflowRepeatPatternCandidates() {
  const [decisions, setDecisions] = useState<readonly CandidateDecision[]>(
    CASHFLOW_REPEAT_PATTERN_CANDIDATES.map(() => null),
  )
  const [lastUpdatedIndex, setLastUpdatedIndex] = useState<number | null>(null)
  const statusRefs = useRef<Array<HTMLParagraphElement | null>>([])

  useEffect(() => {
    if (lastUpdatedIndex !== null) {
      statusRefs.current[lastUpdatedIndex]?.focus()
    }
  }, [lastUpdatedIndex])

  function setDecision(index: number, decision: Exclude<CandidateDecision, null>) {
    setDecisions((currentDecisions) =>
      currentDecisions.map((currentDecision, currentIndex) =>
        currentIndex === index ? decision : currentDecision,
      ),
    )
    setLastUpdatedIndex(index)
  }

  return (
    <section
      aria-labelledby="cashflow-repeat-pattern-title"
      className="rounded-[10px] bg-neutral-100 px-[14px] py-5"
    >
      <h2
        className="text-[18px] leading-[21px] font-bold text-neutral-900"
        id="cashflow-repeat-pattern-title"
      >
        반복 패턴 후보
      </h2>
      <p className="mt-2 text-[12px] leading-[15px] text-secondary-300">
        자동으로 찾은 패턴이에요. 실제와 같은지 확인해 주세요.
      </p>

      <ul className="mt-5 flex flex-col gap-4">
        {CASHFLOW_REPEAT_PATTERN_CANDIDATES.map((candidate, index) => {
          const decision = decisions[index]

          return (
            <li
              className="border-t border-disabled-50 pt-4 first:border-t-0 first:pt-0"
              key={candidate}
            >
              <p className="text-[12px] leading-[15px] font-medium text-primary-100">{candidate}</p>
              {decision ? (
                <p
                  aria-label={`${candidate} ${DECISION_LABELS[decision]}`}
                  aria-live="polite"
                  className="mt-3 text-[12px] leading-[14px] font-semibold text-secondary-500"
                  ref={(element) => {
                    statusRefs.current[index] = element
                  }}
                  role="status"
                  tabIndex={-1}
                >
                  {DECISION_LABELS[decision]}
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    aria-label={`${candidate} 확인`}
                    onClick={() => setDecision(index, 'confirmed')}
                    size="sm"
                    variant="secondary"
                  >
                    확인
                  </Button>
                  <Button
                    aria-label={`${candidate} 해당 없음`}
                    onClick={() => setDecision(index, 'not-applicable')}
                    size="sm"
                    variant="outline"
                  >
                    해당 없음
                  </Button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
