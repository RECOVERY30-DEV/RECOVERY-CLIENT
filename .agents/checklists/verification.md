# Verification Checklist

변경 범위에 맞는 검증을 `docs/workflows/verification.md`에서 선택합니다.

## Harness Or Documentation

- `pnpm check:harness`
- `pnpm test:harness`
- `pnpm test:hooks`
- `git diff --check`

## Application Or Configuration

- 의존성이 바뀌면 `pnpm install --frozen-lockfile`
- TypeScript 또는 설정이 바뀌면 `pnpm typecheck`
- 빌드에 영향을 주면 `pnpm build`
- UI 동작이 바뀌면 개발 서버와 브라우저에서 주요 상태 확인

## Evidence

- 각 명령의 종료 상태와 실패 내용을 직접 확인합니다.
- 실행하지 못한 검증과 이유를 기록합니다.
- 일부 검증 결과를 전체 완료 근거로 확대하지 않습니다.
- 문서와 실제 명령, 경로, 설치 상태가 일치하는지 확인합니다.
