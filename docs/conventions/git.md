# Git Convention

RECOVERY-CLIENT의 브랜치, 커밋, PR 운영 기준입니다.

## 브랜치 역할

| 브랜치 | 역할 |
| --- | --- |
| `main` | 배포 가능한 승격 브랜치 |
| `develop` | 기능과 초기 설정을 통합하는 기본 브랜치 |
| `init/*` | 프로젝트 초기 설정 |
| `feat/*` | 기능 개발 |
| `fix/*` | 버그 수정 |
| `refactor/*` | 동작 변경 없는 구조 개선 |
| `style/*` | UI와 스타일 변경 |
| `docs/*` | 문서 변경 |
| `test/*` | 테스트와 테스트 환경 변경 |
| `deploy/*` | 배포 설정 |
| `chore/*` | 빌드, 패키지, 기타 유지보수 |

## 작업 시작

- 새 작업 브랜치는 최신 `origin/develop`을 기준으로 만듭니다.
- 이미 병합된 브랜치에서 새 작업을 이어가지 않습니다.
- 브랜치명은 `type/영문-작업-요약` 형식을 사용합니다.

예시:

```text
init/harness-setting
feat/login-page
fix/profile-navigation
```

## PR 대상

- 기능, 수정, 초기 설정 PR의 대상은 `develop`입니다.
- `main` 대상 PR은 `develop -> main` 배포 승격 흐름에서만 사용합니다.
- 관련 없는 변경을 같은 PR에 섞지 않습니다.

## 상세 컨벤션

- commit 형식과 책임 단위: `docs/conventions/commit.md`
- PR 제목, 본문, 상태, Stacked PR: `docs/conventions/pull-request.md`

## 원격 작업 승인

- commit, push, PR 생성, PR 상태 변경, merge는 사용자가 해당 작업을 명시적으로 요청한 경우에만 수행합니다.
- force push와 파괴적인 Git 명령은 사용하지 않습니다.
- 예외적인 이력 수정이 필요하면 대상과 영향을 먼저 설명합니다.
