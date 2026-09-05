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

## 디자인 기반

- 색상과 타이포그래피 토큰은 `src/styles/tokens.css`에서 관리합니다.
- 색상은 Tailwind 클래스인 `bg-primary-blue-500`, `text-neutral-900`처럼 사용합니다.
- Tailwind 기본 색상은 제거되어 있으므로 Figma에 정의된 색상 토큰만 사용합니다.
- 타이포그래피는 크기, 행간, 굵기를 묶은 `typo-header-1`, `typo-body-4`처럼 사용합니다.
- Pretendard 가변 폰트는 저장소에 포함해 로컬로 제공하며 라이선스는
  `src/shared/assets/fonts/OFL.txt`에서 확인할 수 있습니다.

## 공통 사용자 인터페이스

여러 화면에서 반복되는 표현 요소는 `src/shared/ui`에서 관리하고 아래처럼 가져옵니다.

```tsx
import { Button, Checkbox, IconButton, Input, Select, Switch, Textarea } from '@/shared/ui'
```

- `Button`: 주요, 보조, 외곽선, 텍스트 형태와 세 가지 크기를 제공합니다.
- `IconButton`: 접근 가능한 이름을 필수로 받는 아이콘 전용 버튼입니다.
- `Input`, `Textarea`: 한 줄과 여러 줄 입력 요소입니다.
- `Checkbox`, `Switch`: 라벨이 연결된 네이티브 선택 요소입니다.
- `Select`: 키보드 조작을 유지하는 네이티브 선택 목록입니다.

업무 의미가 들어간 카드, 위험도 표시, 내비게이션과 화면 전용 모달은 각 기능 영역에서
조합합니다.

## Scripts

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
