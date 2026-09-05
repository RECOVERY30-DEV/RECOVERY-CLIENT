# RECOVERY-CLIENT

RECOVERY30 클라이언트 레포입니다.

## Requirements

- Node.js >= 22.22.1
- pnpm 10.22.0

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`NEXT_PUBLIC_API_BASE_URL`에는 클라이언트에서 호출할 API의 기준 URL을 설정합니다. 비워 두면
브라우저와 같은 출처로 요청합니다. `NEXT_PUBLIC_` 환경 변수는 클라이언트에 공개되므로 비밀값이나
인증 토큰을 넣지 않습니다.

## SVG

`src` 아래 SVG 파일은 React 컴포넌트로 가져옵니다.

```tsx
import Logo from '@/shared/assets/logo.svg'

export function Header() {
  return <Logo aria-label="Recovery30" />
}
```

URL이 필요한 정적 SVG는 `public`에 두고 `/logo.svg`처럼 참조합니다.

## Scripts

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
- `pnpm check`: lint, format, typecheck, test, build, SVGR 통합 검증
- `pnpm test:svgr`: SVG 컴포넌트 변환 통합 테스트
