# Verification

변경 범위에 맞는 검증만 선택하고, 실행하지 못한 검증은 최종 보고에 이유를 남깁니다.

## 문서와 하네스

```bash
pnpm check:harness
pnpm test:harness
pnpm test:hooks
git diff --check
```

## TypeScript와 애플리케이션 코드

```bash
pnpm typecheck
pnpm build
```

테스트 도구가 도입된 뒤에는 변경 영역에 맞는 단위·통합 테스트를 추가합니다. 아직 존재하지 않는 `lint`, `format`, 애플리케이션 `test` 명령을 실행한 것처럼 보고하지 않습니다.

## 의존성과 설정

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

package script, hook, 하네스 설정이 바뀌면 관련 하네스 테스트도 실행합니다.

## UI와 브라우저 동작

- 개발 서버를 실행하고 변경된 화면에 직접 접근합니다.
- 주요 viewport와 loading, error, empty, disabled, success 상태를 확인합니다.
- 사용자 흐름이 바뀌면 브라우저에서 실제 동작을 확인하고 필요한 경우 스크린샷을 남깁니다.
- 브라우저 자동화가 도입되기 전에는 수동으로 확인한 범위를 정확히 보고합니다.

## 최종 확인

- 실패한 검증을 생략하지 않습니다.
- 일부 명령만 성공한 것을 전체 성공으로 확대하지 않습니다.
- 문서 영향, 실행 명령, 결과, 미실행 항목, 남은 위험을 함께 보고합니다.
