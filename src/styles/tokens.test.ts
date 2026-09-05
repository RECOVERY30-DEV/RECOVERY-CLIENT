import tailwindcss from '@tailwindcss/postcss'
import path from 'node:path'
import postcss, { type Root } from 'postcss'
import { beforeAll, describe, expect, it } from 'vitest'

const colorTokens = {
  '--color-base-white': '#ffffff',
  '--color-base-black': '#000000',
  '--color-primary-100': '#303030',
  '--color-primary-200': '#111111',
  '--color-primary-blue-100': '#bae7ff',
  '--color-primary-blue-200': '#97dbff',
  '--color-primary-blue-300': '#74ceff',
  '--color-primary-blue-400': '#52c2ff',
  '--color-primary-blue-500': '#2fb6ff',
  '--color-primary-blue-600': '#2798d5',
  '--color-primary-blue-700': '#1f79aa',
  '--color-primary-blue-800': '#185b80',
  '--color-primary-blue-900': '#103d55',
  '--color-secondary-300': '#5c6583',
  '--color-secondary-400': '#343f64',
  '--color-secondary-500': '#0b1845',
  '--color-secondary-600': '#09143a',
  '--color-secondary-700': '#07102e',
  '--color-secondary-800': '#060c23',
  '--color-secondary-900': '#040817',
  '--color-neutral-50': '#fcfcfc',
  '--color-neutral-100': '#fbfbfb',
  '--color-neutral-200': '#f9f9f9',
  '--color-neutral-300': '#f8f8f8',
  '--color-neutral-600': '#aeb2c1',
  '--color-neutral-700': '#858ca2',
  '--color-neutral-900': '#1f2937',
  '--color-disabled-50': '#e0e0e0',
  '--color-disabled-200': '#a6a6a6',
  '--color-success-500': '#3fdf9a',
  '--color-warning-500': '#f6514f',
  '--color-error-500': '#de3835',
  '--color-danger-500': '#ff8e71',
  '--color-info-500': '#52a0ff',
} as const

const typographyTokens = {
  '.typo-display-1': ['2rem', '2.5rem', '700'],
  '.typo-header-1': ['2rem', '2.25rem', '700'],
  '.typo-header-2': ['1.75rem', '2.25rem', '700'],
  '.typo-header-3': ['1.5rem', '1.75rem', '700'],
  '.typo-header-4': ['1.25rem', '1.5rem', '700'],
  '.typo-sub-header-1': ['1.25rem', '1.5rem', '600'],
  '.typo-sub-header-2': ['1.125rem', '1.625rem', '600'],
  '.typo-sub-header-3': ['1rem', '1.5rem', '600'],
  '.typo-body-1': ['1.125rem', '1.625rem', '500'],
  '.typo-body-2': ['1.125rem', '1.625rem', '400'],
  '.typo-body-3': ['1rem', '1.5rem', '500'],
  '.typo-body-4': ['1rem', '1.5rem', '400'],
  '.typo-body-5': ['0.875rem', '1.25rem', '500'],
  '.typo-body-6': ['0.875rem', '1.25rem', '400'],
  '.typo-body-7': ['0.8125rem', '1.125rem', '400'],
  '.typo-body-8': ['0.75rem', '1.125rem', '500'],
  '.typo-caption-1': ['0.75rem', '1rem', '600'],
  '.typo-caption-2': ['0.6875rem', '1rem', '400'],
  '.typo-caption-3': ['0.75rem', '1rem', '400'],
} as const

const utilityClasses = Object.keys(typographyTokens)
  .map((selector) => selector.slice(1))
  .join(' ')

let compiledCss: Root

beforeAll(async () => {
  const result = await postcss([tailwindcss()]).process(
    `@import './global.css';\n@source inline("${utilityClasses} bg-primary-blue-500 text-neutral-900 border-disabled-50 bg-danger-gradient font-sans bg-red-500 bg-neutral-400 text-content-primary");`,
    { from: path.resolve(process.cwd(), 'src/styles/design-foundations.contract.css') },
  )

  compiledCss = result.root
})

function findCustomProperty(property: string): string | undefined {
  let value: string | undefined

  compiledCss.walkDecls(property, (declaration) => {
    value = declaration.value
  })

  return value
}

function findDeclarations(selector: string): Record<string, string> {
  const declarations: Record<string, string> = {}

  compiledCss.walkRules(selector, (rule) => {
    rule.walkDecls((declaration) => {
      declarations[declaration.prop] = declaration.value
    })
  })

  return declarations
}

describe('디자인 색상 토큰', () => {
  it.each(Object.entries(colorTokens))('%s가 Figma 실제 색상값으로 제공된다', (property, value) => {
    expect(findCustomProperty(property)?.toLowerCase()).toBe(value)
  })

  it('Tailwind 색상 및 그라데이션 클래스로 사용할 수 있다', () => {
    expect(findDeclarations('.bg-primary-blue-500')['background-color']).toBe(
      'var(--color-primary-blue-500)',
    )
    expect(findDeclarations('.text-neutral-900').color).toBe('var(--color-neutral-900)')
    expect(findDeclarations('.border-disabled-50')['border-color']).toBe('var(--color-disabled-50)')
    expect(findDeclarations('.bg-danger-gradient')['background-image']).toBe(
      'var(--background-image-danger-gradient)',
    )
  })

  it('Figma에 없는 Tailwind 기본 색상은 제공하지 않는다', () => {
    expect(findDeclarations('.bg-red-500')).toEqual({})
    expect(findDeclarations('.bg-neutral-400')).toEqual({})
    expect(findDeclarations('.text-content-primary')).toEqual({})
  })

  it('위험 상태 그라데이션의 방향과 색상 순서를 유지한다', () => {
    expect(findCustomProperty('--background-image-danger-gradient')).toBe(
      'linear-gradient(to left, #f6514f, #ff8e71)',
    )
  })
})

describe('디자인 타이포그래피 토큰', () => {
  it.each(Object.entries(typographyTokens))(
    '%s가 Figma 표의 크기, 행간, 굵기를 함께 제공한다',
    (selector, [fontSize, lineHeight, fontWeight]) => {
      const declarations = findDeclarations(selector)

      expect(declarations['font-size']).toBe(fontSize)
      expect(declarations['line-height']).toBe(lineHeight)
      expect(declarations['font-weight']).toBe(fontWeight)
    },
  )

  it('기본 sans 글꼴이 Pretendard 변수와 연결된다', () => {
    expect(findDeclarations('.font-sans')['font-family']).toContain('var(--font-pretendard)')
  })
})
