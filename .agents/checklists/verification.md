# Verification Checklist

변경 범위에 맞는 검증을 `docs/workflows/verification.md`에서 선택합니다.

## Harness Structure

- `AGENTS.md`, 하네스가 라우팅하는 `docs/`, `.agents/checklists`, `.agents/recipes`, `.codex/hooks.json` 또는 관련 package script가 바뀐 경우 `pnpm check:harness`

## Harness Checker

- `.agents/scripts/check-harness.mjs` 또는 `.agents/scripts/harness.test.mjs`가 바뀐 경우 `pnpm test:harness`, `pnpm check:harness`

## Codex Hooks

- `.codex/hooks/`의 script 또는 test가 바뀐 경우 `pnpm test:hooks`

## Application Or Configuration

- 일반 애플리케이션 작업에서는 하네스 검증을 기본 실행하지 않음
- 의존성이 바뀌면 `pnpm install --frozen-lockfile`
- TypeScript 또는 설정이 바뀌면 `pnpm typecheck`
- 빌드에 영향을 주면 `pnpm build`
- UI 동작이 바뀌면 개발 서버와 브라우저에서 주요 상태 확인

## Common

- 변경 종류와 관계없이 `git diff --check`

## Evidence

- 각 명령의 종료 상태와 실패 내용을 직접 확인합니다.
- 실행하지 못한 검증과 이유를 기록합니다.
- 일부 검증 결과를 전체 완료 근거로 확대하지 않습니다.
- 문서와 실제 명령, 경로, 설치 상태가 일치하는지 확인합니다.
