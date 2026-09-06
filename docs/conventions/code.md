# Code Convention

RECOVERY-CLIENT의 TypeScript, React, Next.js 코드 작성 기준입니다. 현재 코드와 도구로 확인할 수 있는 범위만 정의하고, 실제 패턴이 쌓이면 보완합니다.

## 기본 원칙

- 읽기 쉬운 명시적인 코드를 짧은 코드보다 우선합니다.
- 한 파일과 모듈은 하나의 명확한 책임을 갖게 합니다.
- 재사용 근거가 생기기 전에는 공용 abstraction이나 디렉터리를 만들지 않습니다.
- 플랫폼과 현재 저장소 기능으로 해결할 수 있으면 새 dependency를 추가하지 않습니다.
- 주석은 코드가 하는 일을 반복하지 않고 결정 이유와 제약을 설명할 때만 사용합니다.

## 소스 구조

```text
src/
├─ app/       # Next.js 라우팅과 화면 조합
├─ features/  # 사용자 기능 단위
├─ shared/    # 기능에 종속되지 않는 공용 코드
│  ├─ api/    # 공통 서버 통신 기반
│  ├─ config/ # 애플리케이션 공통 설정
│  ├─ lib/    # 순수 함수와 범용 유틸리티
│  ├─ types/  # 여러 기능이 공유하는 타입
│  └─ ui/     # 여러 기능이 공유하는 표현 컴포넌트
├─ styles/    # 애플리케이션 전역 스타일
└─ test/      # 공통 테스트 기반
```

- 의존 방향은 `app → features → shared`로 유지합니다.
- `app`은 라우팅 진입점과 화면 조합을 담당하며, 한 라우트에서만 사용하는 UI는 해당 라우트의 `_components`에 둡니다.
- 기능별 API, component, hook, 상태, type은 `features/<feature-name>` 안에서 함께 관리합니다.
- 기능에 종속되지 않고 실제로 여러 곳에서 사용하는 코드만 `shared`에 둡니다.
- 전역 `components`, `hooks`, `utils`, `constants` 디렉터리를 만들지 않습니다.
- 기능과 공용 하위 디렉터리는 실제 코드가 생길 때 생성하고 빈 구조를 미리 추가하지 않습니다.
- 한 기능이 다른 기능의 내부 파일을 직접 가져오지 않으며, `shared`는 `app`이나 `features`에 의존하지 않습니다.

## TypeScript

- `strict` 설정을 유지하고 오류를 회피하기 위해 설정을 완화하지 않습니다.
- `any` 대신 `unknown`과 type narrowing을 사용합니다.
- component props, 외부 입력, 함수의 공개 경계에는 의도를 알 수 있는 type을 선언합니다.
- 함수 내부의 명확한 값은 TypeScript의 type inference를 활용합니다.
- props와 변경하지 않을 데이터는 `Readonly`로 표현합니다.
- type assertion은 실제 runtime 근거가 있을 때만 사용하고, 외부 데이터는 사용 전에 검증합니다.
- 사용하지 않는 type, 변수, 우회용 suppression을 남기지 않습니다.

## React와 Next.js

- 함수 component를 사용합니다.
- App Router의 page, layout, loading, error 같은 특수 파일은 Next.js의 default export 규칙을 따릅니다.
- 일반 component와 utility는 재사용과 검색이 쉬운 named export를 기본으로 합니다.
- Server Component를 기본값으로 사용합니다.
- state, effect, event handler, browser API가 필요한 경계에만 `'use client'`를 선언합니다.
- Client Component 범위는 가능한 작게 유지하고 server 전용 로직을 client bundle에 포함하지 않습니다.
- hook은 `use`로 시작하고 component 최상위에서 호출합니다.
- state는 실제로 사용하는 가장 가까운 component에 둡니다.

## Naming

| 대상                 | 기준                                | 예시                                      |
| -------------------- | ----------------------------------- | ----------------------------------------- |
| component, type      | `PascalCase`                        | `RecoverySummary`, `RecoverySummaryProps` |
| 함수, 변수           | `camelCase`                         | `getRecoverySummary`, `recoveryCount`     |
| boolean              | `is`, `has`, `can`, `should` 접두사 | `isLoading`, `hasNextPage`                |
| event handler        | `handle` 접두사                     | `handleSubmit`                            |
| hook                 | `use` 접두사                        | `useRecoveryForm`                         |
| module 상수          | `UPPER_SNAKE_CASE`                  | `DEFAULT_PAGE_SIZE`                       |
| 일반 파일과 디렉터리 | `kebab-case`                        | `recovery-summary.tsx`                    |

Next.js가 이름을 정하는 `page.tsx`, `layout.tsx`, `route.ts` 등의 특수 파일은 framework 규칙을 우선합니다.

## Import

다음 순서로 묶고 그룹 사이를 한 줄 띄웁니다.

1. React, Next.js, 외부 package
2. `@/*` alias를 사용하는 프로젝트 내부 module
3. 같은 디렉터리의 상대 경로
4. CSS와 기타 side-effect import

- type 전용 import는 `import type`을 사용합니다.
- 여러 단계의 `../../../` 경로보다 `@/*` alias를 사용합니다.
- 같은 module 안의 가까운 파일은 상대 경로를 허용합니다.
- 순환 의존성을 만들기 위해 barrel file을 추가하지 않습니다.

## Component와 함수 책임

- page는 routing 진입점과 화면 조합 책임을 가집니다.
- 반복되는 표현과 동작이 확인되면 component나 함수로 분리합니다.
- JSX 조건이 복잡해지면 의미 있는 변수나 작은 component로 분리합니다.
- 함수는 한 가지 작업을 수행하고, boolean 인수로 서로 다른 책임을 숨기지 않습니다.
- 예상 가능한 실패를 빈 `catch`로 숨기지 않습니다.
- 사용자에게 보여줄 오류와 개발자가 확인할 오류를 구분합니다.

## CSS 범위

- `src/styles/global.css`는 Tailwind와 전역 스타일 파일을 연결하는 진입점으로 사용합니다.
- 브라우저 기본 스타일 정리는 `src/styles/reset.css`에 둡니다.
- 실제 공통 색상, 간격, 글꼴이 정해지면 `src/styles/tokens.css`를 생성합니다.
- component style은 Tailwind utility class를 기본으로 하며 조건부 조합에는 `cn` 또는 `cva`를 사용합니다.

## 현재 강제 수준

- TypeScript 규칙은 `pnpm typecheck`와 `pnpm build`로 확인합니다.
- lint와 format 규칙은 관련 도구를 도입하는 별도 작업에서 자동 강제합니다.
- 문서만으로 반복해서 놓치는 항목이 확인되면 lint, test, hook, CI 중 가장 작은 적합한 장치로 승격합니다.
