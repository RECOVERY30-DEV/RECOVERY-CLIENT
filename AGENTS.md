# AGENTS

이 문서는 RECOVERY-CLIENT에서 작업하는 에이전트의 라우팅 허브입니다. 상세 규칙을 복제하지 않고 필요한 문서 경로만 안내합니다.

## 저장소 정체

- RECOVERY30의 Next.js App Router 기반 웹 클라이언트입니다.
- 애플리케이션 코드는 `src/app`에서 시작합니다.
- 패키지 매니저는 `pnpm`입니다.
- 기능과 초기 설정은 `develop`에 통합하고, `main`은 배포 가능한 승격 브랜치로 사용합니다.

## 모든 작업에서 먼저 읽기

1. `docs/agent/working-agreement.md`
2. `docs/rules/project.md`
3. `.agents/checklists/pre-work.md`

## Source of Truth

- 에이전트 협업 방식: `docs/agent/working-agreement.md`
- 프로젝트 불변 규칙: `docs/rules/project.md`
- Git과 브랜치 규칙: `docs/conventions/git.md`
- 검증 선택 기준: `docs/workflows/verification.md`
- 하네스 구조와 성장 기준: `docs/agent/harness.md`
- 에이전트 실행 절차: `.agents/`
- 실제 설치 상태와 명령: `package.json`, `pnpm-lock.yaml`, 현재 코드와 설정

문서와 실제 저장소 상태가 다르면 추측하지 않습니다. 실제 상태를 확인하고 문서 동기화 필요 여부를 보고합니다.

## 작업 유형별 라우팅

| 작업 유형 | 추가로 읽을 문서 |
| --- | --- |
| branch, commit, push, PR, merge | `docs/conventions/git.md` |
| dependency, build, config | `docs/rules/project.md`, `docs/workflows/verification.md` |
| page, route, UI | 기존 `src/app` 코드, `docs/workflows/verification.md` |
| agent harness | `docs/agent/harness.md`, `.agents/README.md` |
| PR review | `.agents/recipes/skeptical-pr-review.md` |

작업별 문서가 아직 없다면 현재 코드와 설정을 먼저 확인합니다. 존재하지 않는 아키텍처나 라이브러리 규칙을 추측해 만들지 않습니다.

## 작업 전후 흐름

- 작업 전 `.agents/checklists/pre-work.md`를 확인합니다.
- 변경 범위에 맞는 검증은 `.agents/checklists/verification.md`와 `docs/workflows/verification.md`에서 선택합니다.
- 최종 응답 전 `.agents/checklists/final-report.md`를 확인합니다.
- 반복 가능한 패턴이 발견되면 `docs/agent/harness.md`의 승격 기준에 따라 후보를 먼저 제안합니다.

## 이 파일에 넣지 않을 내용

- 긴 구현 규칙 원문
- 세부 아키텍처 설명
- 현재 상태의 긴 목록
- 과거 작업 로그
- 다른 문서의 복사본
- 아직 도입하지 않은 skill, spec, 라이브러리를 현재 기능처럼 설명하는 내용
