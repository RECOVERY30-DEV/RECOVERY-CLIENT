# 소스 폴더 구조 구현 계획

> **작업자 필수:** 이 계획은 `superpowers:executing-plans`를 사용해 항목별로 실행합니다. 각 단계는 체크박스로 진행 상태를 기록합니다.

**목표:** 현재 소스 파일을 기능 중심 구조의 기반에 맞게 이동하고, 경로를 참조하는 설정과 문서를 일관되게 갱신합니다.

**구조:** Next.js 라우팅 코드는 `src/app`, 전역 스타일은 `src/styles`, 기능 비종속 공용 코드는 `src/shared/lib`, 공통 테스트 기반은 `src/test`가 소유합니다. 앞으로 추가되는 기능은 `src/features/<feature-name>`에 모으되, 이번 작업에서는 빈 디렉터리를 생성하지 않습니다.

**기술:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prettier, Vitest, pnpm 10.22.0

**설계:** `docs/superpowers/specs/2026-09-02-source-structure-design.md`

## 전체 제약

- 패키지 설치와 명령 실행에는 pnpm만 사용합니다.
- 일반 파일과 디렉터리 이름은 kebab-case를 사용합니다.
- 의존 방향은 `app → features → shared`로 제한합니다.
- 전역 스타일 파일명은 `global.css`를 사용합니다.
- 실제 코드가 없는 빈 디렉터리는 생성하지 않습니다.
- 사용자 요청과 관계없는 파일은 수정하거나 커밋하지 않습니다.
- 검증 진입점은 `pnpm check`를 사용합니다.

---

### 작업 1: 전역 스타일 계층 분리

**파일:**

- 생성: `src/styles/global.css`
- 생성: `src/styles/reset.css`
- 삭제: `src/app/globals.css`
- 수정: `src/app/layout.tsx`
- 수정: `prettier.config.mjs`
- 수정: `.frontprep.json`

**경계:**

- 입력: 기존 `src/app/globals.css`의 Tailwind 연결과 reset 규칙
- 출력: 루트 레이아웃이 한 번만 가져오는 `@/styles/global.css`

- [ ] **1단계: 목표 경로가 아직 없음을 확인**

  실행: `test -f src/styles/global.css`

  예상: 파일이 아직 없으므로 종료 코드 1

- [ ] **2단계: 스타일 파일을 책임별로 분리**

  `src/styles/global.css`:

  ```css
  @import 'tailwindcss';
  @import './reset.css';
  ```

  `src/styles/reset.css`:

  ```css
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }
  ```

  기존 `src/app/globals.css`는 삭제합니다.

- [ ] **3단계: 전역 스타일 참조 경로 갱신**

  `src/app/layout.tsx`의 CSS 가져오기를 다음처럼 변경합니다.

  ```ts
  import '@/styles/global.css'
  ```

  `prettier.config.mjs`의 `tailwindStylesheet` 값을 다음처럼 변경합니다.

  ```ts
  tailwindStylesheet: './src/styles/global.css',
  ```

  `.frontprep.json`에서는 다음을 함께 변경합니다.

  - `paths.stylesheet`: `src/styles/global.css`
  - `files`의 `src/app/globals.css` 키: `src/styles/global.css`
  - 새 파일 내용으로 계산한 SHA-256 값을 해당 파일의 `hash`에 기록

- [ ] **4단계: 이전 스타일 경로가 제거됐는지 확인**

  실행: `rg -n "src/app/globals\.css|\./globals\.css" src prettier.config.mjs .frontprep.json`

  예상: 검색 결과 없음

- [ ] **5단계: 스타일 이동 검증**

  실행: `pnpm format:check`

  예상: 종료 코드 0

  실행: `pnpm typecheck`

  예상: 종료 코드 0

  실행: `pnpm build`

  예상: 종료 코드 0

- [ ] **6단계: 스타일 구조 변경 커밋**

  ```bash
  git add src/app/layout.tsx src/app/globals.css src/styles/global.css src/styles/reset.css prettier.config.mjs .frontprep.json
  git commit -m "refactor: 전역 스타일 파일 구조 정리"
  ```

### 작업 2: 공용 유틸리티를 lib 계층으로 이동

**파일:**

- 생성: `src/shared/lib/cn.ts`
- 생성: `src/shared/lib/index.ts`
- 삭제: `src/shared/utils/cn.ts`
- 삭제: `src/shared/utils/index.ts`
- 수정: `.frontprep.json`

**경계:**

- 입력: 기존 `cn(...inputs: ClassValue[]): string`, `cva`, `VariantProps` 공개 항목
- 출력: 같은 공개 항목을 제공하는 `@/shared/lib`

- [ ] **1단계: 목표 경로가 아직 없음을 확인**

  실행: `test -f src/shared/lib/cn.ts`

  예상: 파일이 아직 없으므로 종료 코드 1

- [ ] **2단계: 기존 구현을 lib로 이동**

  `src/shared/lib/cn.ts`:

  ```ts
  import { clsx, type ClassValue } from 'clsx'
  import { twMerge } from 'tailwind-merge'

  export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
  }
  ```

  `src/shared/lib/index.ts`:

  ```ts
  export { cva, type VariantProps } from 'class-variance-authority'
  export { cn } from './cn'
  ```

  기존 `src/shared/utils/cn.ts`와 `src/shared/utils/index.ts`는 삭제합니다.

- [ ] **3단계: Frontprep 파일 소유 경로 갱신**

  `.frontprep.json`의 `files` 키를 다음처럼 변경하고 기존 해시는 유지합니다.

  - `src/shared/utils/cn.ts` → `src/shared/lib/cn.ts`
  - `src/shared/utils/index.ts` → `src/shared/lib/index.ts`

- [ ] **4단계: 이전 유틸리티 경로가 제거됐는지 확인**

  실행: `rg -n "shared/utils|src/shared/utils" src .frontprep.json docs`

  예상: 설계 문서의 이전 경로를 설명하는 이동표 외에는 검색 결과 없음

- [ ] **5단계: 공용 모듈 이동 검증**

  실행: `pnpm typecheck`

  예상: 종료 코드 0

  실행: `pnpm format:check`

  예상: 종료 코드 0

- [ ] **6단계: 공용 모듈 이동 커밋**

  ```bash
  git add src/shared/utils/cn.ts src/shared/utils/index.ts src/shared/lib/cn.ts src/shared/lib/index.ts .frontprep.json
  git commit -m "refactor: 공용 유틸리티를 lib 계층으로 이동"
  ```

### 작업 3: 폴더 구조 규칙 문서화와 전체 검증

**파일:**

- 수정: `docs/conventions/code.md`

**경계:**

- 입력: 승인된 소스 폴더 구조 설계
- 출력: 새 기능을 추가할 때 적용하는 위치와 의존 방향 규칙

- [ ] **1단계: 코드 규칙에 소스 구조 기준 추가**

  `docs/conventions/code.md`에 다음 내용을 명시합니다.

  - `app`, `features`, `shared`, `styles`, `test`의 책임
  - `app → features → shared` 의존 방향
  - 기능 코드를 전역 `components`, `hooks`, `utils`로 흩뜨리지 않는 기준
  - 라우트 전용 컴포넌트는 해당 라우트의 `_components`에 두는 기준
  - 기능과 공용 디렉터리는 실제 코드가 생길 때 생성하는 기준

- [ ] **2단계: 문서 형식 확인**

  실행: `pnpm format:check`

  예상: 종료 코드 0

- [ ] **3단계: 저장소 전체 검증**

  실행: `pnpm check`

  예상: lint 오류 0, 형식 검사·타입 검사·Vitest·Next.js 운영 빌드 통과

  실행: `pnpm check:harness`

  예상: `Harness check passed.` 출력과 종료 코드 0

  실행: `git diff --check`

  예상: 출력 없음과 종료 코드 0

- [ ] **4단계: 구조 규칙 문서 커밋**

  ```bash
  git add docs/conventions/code.md docs/superpowers/plans/2026-09-02-source-structure.md
  git commit -m "docs: 기능 중심 소스 구조 규칙 명문화"
  ```

### 작업 4: 원격 PR 검증

**파일:** 없음

**경계:**

- 입력: 작업 1~3의 검증된 커밋
- 출력: 기존 PR 브랜치와 통과한 GitHub Actions 검사

- [ ] **1단계: 작업 트리와 커밋 범위 확인**

  실행: `git status --short --branch --untracked-files=all`

  예상: 작업 트리가 깨끗하고 원격 브랜치보다 새 커밋만큼 앞선 상태

- [ ] **2단계: 기존 브랜치 푸시**

  실행: `git push origin chore/frontprep-baseline`

  예상: 새 커밋이 기존 PR 브랜치에 반영됨

- [ ] **3단계: 원격 CI 확인**

  실행: `gh pr checks 5 --repo RECOVERY30-DEV/RECOVERY-CLIENT --watch --interval 10`

  예상: 모든 검사 통과
