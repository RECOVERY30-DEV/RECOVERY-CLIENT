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

## Scripts

- `pnpm dev`: 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
