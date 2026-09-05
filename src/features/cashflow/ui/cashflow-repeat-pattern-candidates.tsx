'use client'

import { useState } from 'react'

import { Button } from '@/shared/ui'

import { CASHFLOW_REPEAT_PATTERN_CANDIDATES } from '../model/cashflow-correction-data'

type CandidateDecision = 'confirmed' | 'not-applicable' | null

export function CashflowRepeatPatternCandidates() {
  const [decisions, setDecisions] = useState<readonly CandidateDecision[]>(
    CASHFLOW_REPEAT_PATTERN_CANDIDATES.map(() => null),
  )

  function setDecision(index: number, decision: Exclude<CandidateDecision, null>) {
    setDecisions((currentDecisions) =>
      currentDecisions.map((currentDecision, currentIndex) =>
        currentIndex === index ? decision : currentDecision,
      ),
    )
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
                <p className="mt-3 text-[12px] leading-[14px] font-semibold text-info-500">
                  {decision === 'confirmed' ? '확인됨' : '해당 없음'}
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => setDecision(index, 'confirmed')}
                    size="sm"
                    variant="secondary"
                  >
                    확인
                  </Button>
                  <Button
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
