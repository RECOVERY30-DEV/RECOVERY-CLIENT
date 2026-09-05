# Agent Harness

`.agents`는 `docs`의 규칙을 에이전트가 실제 작업에 적용하기 위한 실행 자산을 담습니다.

## 진입 순서

1. 루트 `AGENTS.md`
2. `docs/agent/working-agreement.md`
3. `docs/rules/project.md`
4. `.agents/checklists/pre-work.md`
5. 작업 유형에 맞는 문서와 recipe
6. `.agents/checklists/verification.md`
7. `.agents/checklists/final-report.md`

## 구조

| 경로          | 역할                                           |
| ------------- | ---------------------------------------------- |
| `checklists/` | 작업 전, 검증, 최종 보고 공통 확인             |
| `recipes/`    | 반복 작업의 짧고 고정된 순서                   |
| `scripts/`    | 결정적으로 검사할 수 있는 하네스 규칙과 테스트 |

## Source of Truth

- 규칙 원문은 `docs/`에 둡니다.
- `.agents/`에는 실행 순서와 검사 방법만 둡니다.
- 둘이 충돌하면 실제 저장소 상태를 확인하고 `docs/`를 먼저 바로잡습니다.

## 성장 원칙

반복적으로 놓치는 항목은 다음 순서에서 가장 작은 적합한 단계로 승격합니다.

```text
docs -> checklist -> recipe -> skill -> script/test/hook -> CI
```

실제 skill이 승인되기 전에는 빈 `.agents/skills` 디렉터리를 만들지 않습니다. 원본 프롬프트나 대화 로그는 하네스에 저장하지 않습니다.
