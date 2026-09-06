import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import RecoveryMark from './fixtures/recovery-mark.svg'

describe('SVGR', () => {
  it('SVG 파일을 React 컴포넌트로 렌더링한다', () => {
    render(<RecoveryMark aria-label="Recovery mark" />)

    expect(screen.getByLabelText('Recovery mark')).toBeInTheDocument()
  })
})
