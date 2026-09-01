# Verification

변경 범위에 맞는 검증만 선택하고, 실행하지 못한 검증은 최종 보고에 이유를 남깁니다.

## 선택 원칙

- 일반 애플리케이션 작업에서는 하네스 검증을 기본 실행하지 않습니다.
- 하네스 구조가 바뀌면 `pnpm check:harness`를 실행합니다.
- 하네스 검사기 자체가 바뀌면 `pnpm test:harness`도 실행합니다.
- Codex hook script나 test가 바뀌면 `pnpm test:hooks`를 실행합니다.
- 변경 종류와 관계없이 `git diff --check`를 실행합니다.

## 하네스 변경

| 변경 대상                                                               | 실행 명령                                 |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| `AGENTS.md`, 하네스가 라우팅하는 `docs/`                                | `pnpm check:harness`                      |
| `.agents/checklists/`, `.agents/recipes/`                               | `pnpm check:harness`                      |
| `.agents/scripts/check-harness.mjs`, `.agents/scripts/harness.test.mjs` | `pnpm test:harness`, `pnpm check:harness` |
| `.codex/hooks.json`                                                     | `pnpm check:harness`, `pnpm test:hooks`   |
| `.codex/hooks/` script와 test                                           | `pnpm test:hooks`                         |
| `package.json`의 하네스 script                                          | `pnpm check:harness`와 영향받는 test      |

`pnpm check:harness`는 현재 저장소 구조를 확인하고, `pnpm test:harness`는 검사기 자체를 변경했을 때만 검사기의 실패 조건을 확인합니다.

## TypeScript와 애플리케이션 코드

```bash
pnpm typecheck
pnpm build
```

`src/` 아래 일반 component, page, route, utility만 변경했다면 하네스 명령은 실행하지 않습니다. 테스트 도구가 도입된 뒤에는 변경 영역에 맞는 단위·통합 테스트를 추가합니다. 아직 존재하지 않는 `lint`, `format`, 애플리케이션 `test` 명령을 실행한 것처럼 보고하지 않습니다.

## 의존성과 설정

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

package script, hook, 하네스 설정이 바뀌면 위 표에서 직접 영향받는 하네스 검증만 추가합니다.

## UI와 브라우저 동작

- 개발 서버를 실행하고 변경된 화면에 직접 접근합니다.
- 주요 viewport와 loading, error, empty, disabled, success 상태를 확인합니다.
- 사용자 흐름이 바뀌면 브라우저에서 실제 동작을 확인하고 필요한 경우 스크린샷을 남깁니다.
- 브라우저 자동화가 도입되기 전에는 수동으로 확인한 범위를 정확히 보고합니다.

## 최종 확인

- 실패한 검증을 생략하지 않습니다.
- 일부 명령만 성공한 것을 전체 성공으로 확대하지 않습니다.
- 문서 영향, 실행 명령, 결과, 미실행 항목, 남은 위험을 함께 보고합니다.
