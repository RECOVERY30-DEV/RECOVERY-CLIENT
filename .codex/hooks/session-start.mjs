import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const PRIMER = `RECOVERY-CLIENT project context:
- AGENTS.md로 작업 유형을 분류하고 필요한 문서만 읽습니다.
- 모든 작업에서 docs/agent/working-agreement.md와 docs/rules/project.md를 먼저 읽습니다.
- pnpm만 사용하고 변경 전 현재 브랜치와 작업트리를 확인합니다.
- 새 작업은 develop에서 시작하며 기능 PR은 develop을 대상으로 합니다.
- 관련 없는 사용자 변경을 보존합니다.
- commit, push, PR, merge는 각각 명시적으로 요청받았을 때만 수행합니다.
- 구현 후 문서 영향과 실행한 검증 결과를 보고합니다.`

const isInside = (candidate, parent) => {
  const relative = path.relative(parent, candidate)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

export const createSessionStartOutput = (payload, repoRoot) => {
  const cwd = path.resolve(typeof payload?.cwd === 'string' ? payload.cwd : repoRoot)
  const resolvedRoot = path.resolve(repoRoot)

  if (!isInside(cwd, resolvedRoot)) {
    return null
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: PRIMER,
    },
  }
}

const readPayload = () => {
  const input = readFileSync(0, 'utf8')

  if (input.trim().length === 0) {
    return {}
  }

  try {
    return JSON.parse(input)
  } catch {
    return {}
  }
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const output = createSessionStartOutput(readPayload(), repoRoot)

  if (output) {
    process.stdout.write(`${JSON.stringify(output)}\n`)
  }
}
