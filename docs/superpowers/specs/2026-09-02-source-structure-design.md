# 소스 폴더 구조 설계

## 배경

현재 `src`에는 Next.js 라우트, 전역 스타일, 공용 유틸리티, 테스트 설정만 있습니다. 기능이 늘어나기 전에 각 코드의 소유 위치와 의존 방향을 정해 두어야 파일 종류별 최상위 폴더가 계속 늘어나는 문제를 피할 수 있습니다.

첨부 예시처럼 `api`, `components`, `hooks`, `utils`를 모두 최상위에 두면 구조는 단순하지만, 로그인 같은 하나의 기능이 여러 폴더로 흩어집니다. 이 프로젝트에서는 기능을 먼저 묶고 그 안에서 파일 역할을 나누는 구조를 사용합니다.

## 목표

- Next.js `app` 디렉터리는 라우팅과 화면 조합에 집중합니다.
- 기능별 코드는 `features` 아래에 함께 둡니다.
- 여러 기능이 실제로 공유하는 코드만 `shared`에 둡니다.
- 전역 스타일과 테스트 기반 파일의 위치를 명확하게 분리합니다.
- 빈 디렉터리와 사용하지 않는 추상화는 미리 만들지 않습니다.

## 선택한 구조

```text
src/
├─ app/                          # Next.js 라우팅과 화면 조합
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ _components/              # 해당 라우트에서만 쓰는 UI가 생길 때 생성
├─ features/                     # 사용자 기능 단위
│  └─ <feature-name>/
│     ├─ api/                    # 기능 전용 서버 통신
│     ├─ components/             # 기능 전용 UI
│     ├─ hooks/                  # 기능 전용 React 훅
│     ├─ model/                  # 상태와 비즈니스 규칙
│     ├─ types/                  # 기능 전용 타입
│     └─ index.ts                # 다른 계층에 공개하는 항목
├─ shared/                       # 기능에 종속되지 않는 공용 코드
│  ├─ api/                       # 공통 HTTP 클라이언트와 요청 기반 코드
│  ├─ config/                    # 애플리케이션 공통 설정
│  ├─ lib/                       # 순수 함수와 범용 유틸리티
│  ├─ types/                     # 여러 기능이 공유하는 타입
│  └─ ui/                        # 여러 기능이 공유하는 표현 컴포넌트
├─ styles/                       # 애플리케이션 전역 스타일
│  ├─ global.css                 # Tailwind와 전역 스타일 진입점
│  ├─ reset.css                  # 브라우저 기본 스타일 정리
│  └─ tokens.css                 # 실제 디자인 토큰이 생길 때 생성
└─ test/                         # 공통 테스트 기반
   ├─ setup.ts
   ├─ fixtures/                  # 공통 고정 데이터가 생길 때 생성
   └─ mocks/                     # 공통 모의 구현이 생길 때 생성
```

구조 문서에는 앞으로 생성할 위치까지 표시하지만, Git에는 실제 코드가 있는 디렉터리만 추가합니다.

## 배치 규칙

### 라우트와 기능

- `src/app`에는 `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`와 화면 조합 코드만 둡니다.
- 한 라우트에서만 사용하는 작은 컴포넌트는 해당 라우트의 `_components`에 둡니다.
- 로그인, 대시보드, 자산 조회처럼 독립된 사용자 동작은 `src/features/<feature-name>`에 둡니다.
- 기능 내부 코드는 가장 가까운 기능 폴더에 두고, 재사용 근거 없이 `shared`로 올리지 않습니다.

### 공용 코드

- `cn` 같은 기능 비종속 순수 함수는 `src/shared/lib`에 둡니다.
- 공통 UI는 두 곳 이상에서 실제로 재사용될 때 `src/shared/ui`로 옮깁니다.
- 전역 `components`, `hooks`, `utils`, `constants` 폴더는 만들지 않습니다.
- 상수와 타입은 기본적으로 사용하는 기능 가까이에 두고, 여러 기능의 공통 계약일 때만 `shared/config` 또는 `shared/types`에 둡니다.

### 서버 통신과 자산

- 공통 HTTP 클라이언트는 `src/shared/api`, 기능별 요청 함수는 해당 기능의 `api`에 둡니다.
- URL로 직접 제공할 이미지와 아이콘은 Next.js의 `public`에 둡니다.
- 코드에서 모듈로 가져오는 공용 자산이 생기면 `src/shared/assets`를 생성합니다.

### 스타일과 테스트

- `src/styles/global.css`는 Tailwind와 다른 전역 스타일 파일을 연결하는 진입점으로 사용합니다.
- reset은 `src/styles/reset.css`로 분리합니다.
- 색상, 간격, 글꼴 같은 실제 공통 값이 정해질 때만 `tokens.css`를 생성합니다.
- 애플리케이션 테스트는 대상 코드 옆에 `*.test.ts` 또는 `*.test.tsx`로 둡니다.
- `src/test`에는 모든 테스트가 공유하는 설정, 고정 데이터, 모의 구현만 둡니다.

## 의존 방향

```text
app → features → shared
```

- `app`은 `features`와 `shared`를 사용할 수 있습니다.
- `features`는 `shared`를 사용할 수 있지만 `app`을 가져오지 않습니다.
- 한 기능이 다른 기능의 내부 파일을 직접 가져오지 않습니다.
- `shared`는 `app`이나 `features`에 의존하지 않습니다.
- 외부에서 기능을 사용할 때는 가능한 한 기능의 `index.ts`에 공개된 항목만 가져옵니다.

## 이번 변경 범위

```text
src/app/globals.css          → src/styles/global.css
src/shared/utils/cn.ts       → src/shared/lib/cn.ts
src/shared/utils/index.ts    → src/shared/lib/index.ts
```

함께 수정할 항목은 다음과 같습니다.

- 루트 레이아웃의 전역 CSS 가져오기 경로
- Prettier Tailwind 스타일시트 경로
- Frontprep 적용 상태의 파일 경로와 해시
- 코드 규칙 문서의 폴더 구조와 의존 방향

기능 코드가 없으므로 `features`, `shared/api`, `shared/ui`, `tokens.css` 같은 빈 구조는 이번 변경에서 생성하지 않습니다.

## 검증

- 이전 경로가 코드와 설정에 남아 있지 않은지 검색합니다.
- `pnpm check`로 코드 검사, 형식 검사, 타입 검사, 애플리케이션 테스트, 운영 빌드를 확인합니다.
- `pnpm check:harness`로 저장소 하네스 구조를 확인합니다.
- `git diff --check`로 공백 오류를 확인합니다.
