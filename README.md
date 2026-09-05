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

## Scripts

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
