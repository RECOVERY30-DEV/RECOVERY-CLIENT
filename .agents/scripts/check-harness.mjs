import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const REQUIRED_PATHS = [
  'AGENTS.md',
  '.agents/README.md',
  '.agents/checklists/final-report.md',
  '.agents/checklists/pre-work.md',
  '.agents/checklists/verification.md',
  '.agents/recipes/skeptical-pr-review.md',
  '.agents/scripts/check-harness.mjs',
  '.agents/scripts/harness.test.mjs',
  '.codex/hooks.json',
  '.codex/hooks/hooks.test.mjs',
  '.codex/hooks/session-start.mjs',
  '.codex/hooks/shell-guard.mjs',
  'docs/agent/harness.md',
  'docs/agent/working-agreement.md',
  'docs/conventions/code.md',
  'docs/conventions/commit.md',
  'docs/conventions/git.md',
  'docs/conventions/pull-request.md',
  'docs/rules/project.md',
  'docs/workflows/verification.md',
  'package.json',
]

const REQUIRED_AGENT_ROUTES = [
  'docs/agent/working-agreement.md',
  'docs/rules/project.md',
  '.agents/checklists/pre-work.md',
  'docs/conventions/code.md',
  'docs/conventions/commit.md',
  'docs/conventions/pull-request.md',
]

const REQUIRED_PACKAGE_SCRIPTS = [
  'check:harness',
  'test:harness',
  'test:hooks',
  'typecheck',
]

const TEXT_PATHS = [
  'AGENTS.md',
  '.agents/README.md',
  '.agents/checklists/final-report.md',
  '.agents/checklists/pre-work.md',
  '.agents/checklists/verification.md',
  '.agents/recipes/skeptical-pr-review.md',
  'docs/agent/harness.md',
  'docs/agent/working-agreement.md',
  'docs/conventions/code.md',
  'docs/conventions/commit.md',
  'docs/conventions/git.md',
  'docs/conventions/pull-request.md',
  'docs/rules/project.md',
  'docs/workflows/verification.md',
]

const FORBIDDEN_TERMS = [
  ['@hashi', /@hashi/i],
  ['Hashi', /\bhashi\b/i],
  ['HDS', /\bHDS\b/],
  ['apps/client', /apps\/client/],
  ['packages/hds', /packages\/hds/],
]

const pathExists = async (targetPath) => {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

const readText = (root, relativePath) =>
  readFile(path.join(root, relativePath), 'utf8')

const extractRoutedPaths = (markdown) => {
  const matches = markdown.matchAll(/`([^`\n]+)`/g)
  const routedPaths = new Set()

  for (const [, value] of matches) {
    const candidate = value.replace(/\/$/, '')
    const isLocalPath =
      /^(?:docs|\.agents|\.codex|src)\//.test(candidate) ||
      /^(?:package\.json|pnpm-lock\.yaml)$/.test(candidate)
    const isConcretePath = !/[\s*{}<>|]/.test(candidate)

    if (isLocalPath && isConcretePath) {
      routedPaths.add(candidate)
    }
  }

  return [...routedPaths]
}

export const collectHarnessErrors = async (root) => {
  const errors = []
  const existingPaths = new Set()

  for (const relativePath of REQUIRED_PATHS) {
    if (await pathExists(path.join(root, relativePath))) {
      existingPaths.add(relativePath)
    } else {
      errors.push(
        `필수 하네스 경로가 없습니다: ${relativePath}. 경로를 생성하거나 라우팅 목록을 갱신하세요.`,
      )
    }
  }

  if (existingPaths.has('AGENTS.md')) {
    const agents = await readText(root, 'AGENTS.md')
    const lineCount = agents.length === 0 ? 0 : agents.trimEnd().split(/\r?\n/).length

    if (lineCount > 100) {
      errors.push(
        `AGENTS.md가 ${lineCount}줄입니다. 100줄 이하의 라우팅 허브로 줄이고 상세 내용은 docs/로 옮기세요.`,
      )
    }

    for (const requiredRoute of REQUIRED_AGENT_ROUTES) {
      if (!agents.includes(`\`${requiredRoute}\``)) {
        errors.push(
          `AGENTS.md에 필수 라우팅 경로가 없습니다: ${requiredRoute}. 작업 유형에 맞게 라우팅하세요.`,
        )
      }
    }

    for (const routedPath of extractRoutedPaths(agents)) {
      if (!(await pathExists(path.join(root, routedPath)))) {
        errors.push(
          `AGENTS.md가 존재하지 않는 로컬 경로를 가리킵니다: ${routedPath}. 경로 또는 문서를 수정하세요.`,
        )
      }
    }
  }

  for (const relativePath of TEXT_PATHS) {
    if (!existingPaths.has(relativePath)) {
      continue
    }

    const content = await readText(root, relativePath)

    for (const [label, pattern] of FORBIDDEN_TERMS) {
      if (pattern.test(content)) {
        errors.push(
          `Hashi 전용 표현 '${label}'이 ${relativePath}에 남아 있습니다. RECOVERY30 기준으로 치환하세요.`,
        )
      }
    }
  }

  if (existingPaths.has('.codex/hooks.json')) {
    try {
      JSON.parse(await readText(root, '.codex/hooks.json'))
    } catch (error) {
      errors.push(
        `.codex/hooks.json을 파싱할 수 없습니다: ${error.message}. 유효한 JSON으로 수정하세요.`,
      )
    }
  }

  if (existingPaths.has('package.json')) {
    try {
      const packageJson = JSON.parse(await readText(root, 'package.json'))
      const scripts = packageJson.scripts ?? {}

      for (const script of REQUIRED_PACKAGE_SCRIPTS) {
        if (typeof scripts[script] !== 'string' || scripts[script].length === 0) {
          errors.push(
            `package.json에 '${script}' script가 없습니다. 하네스 검증 진입점을 등록하세요.`,
          )
        }
      }
    } catch (error) {
      errors.push(`package.json을 파싱할 수 없습니다: ${error.message}.`)
    }
  }

  return errors
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))

if (isDirectRun) {
  const errors = await collectHarnessErrors(process.cwd())

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[harness] ${error}`)
    }

    process.exitCode = 1
  } else {
    console.log(`Harness check passed (${REQUIRED_PATHS.length} required paths).`)
  }
}
