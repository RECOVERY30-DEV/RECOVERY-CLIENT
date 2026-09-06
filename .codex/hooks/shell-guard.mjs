import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BLOCKED_PACKAGE_MANAGERS = new Set(['npm', 'npx', 'yarn', 'bun', 'bunx'])
const COMMAND_SEPARATORS = new Set(['&&', '||', ';', '|', '&', '(', ')'])
const SHELL_WRAPPERS = new Set(['bash', 'sh', 'zsh'])
const GIT_OPTIONS_WITH_VALUE = new Set([
  '-C',
  '-c',
  '--git-dir',
  '--work-tree',
  '--namespace',
  '--exec-path',
  '--config-env',
])

const binaryName = (value) => path.basename(value)
const isAssignment = (value) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(value)

export const tokenizeShell = (command) => {
  const tokens = []
  let current = ''
  let quote = null
  let escaped = false

  const flush = () => {
    if (current.length > 0) {
      tokens.push(current)
      current = ''
    }
  }

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index]

    if (escaped) {
      current += character
      escaped = false
      continue
    }

    if (character === '\\' && quote !== "'") {
      escaped = true
      continue
    }

    if (quote) {
      if (character === quote) {
        quote = null
      } else {
        current += character
      }
      continue
    }

    if (character === "'" || character === '"') {
      quote = character
      continue
    }

    if (/\s/.test(character)) {
      flush()
      continue
    }

    if (';&|()'.includes(character)) {
      flush()
      const pair = `${character}${command[index + 1] ?? ''}`

      if (pair === '&&' || pair === '||') {
        tokens.push(pair)
        index += 1
      } else {
        tokens.push(character)
      }
      continue
    }

    current += character
  }

  if (escaped) {
    current += '\\'
  }

  flush()
  return tokens
}

const commandSegments = (tokens) => {
  const segments = []
  let current = []

  for (const token of tokens) {
    if (COMMAND_SEPARATORS.has(token)) {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
    } else {
      current.push(token)
    }
  }

  if (current.length > 0) {
    segments.push(current)
  }

  return segments
}

const effectiveCommand = (segment) => {
  let index = 0

  while (index < segment.length && isAssignment(segment[index])) {
    index += 1
  }

  if (index >= segment.length) {
    return null
  }

  let command = binaryName(segment[index])
  let args = segment.slice(index + 1)

  if (command === 'env') {
    let envIndex = 0

    while (
      envIndex < args.length &&
      (isAssignment(args[envIndex]) || args[envIndex].startsWith('-'))
    ) {
      envIndex += 1
    }

    if (envIndex >= args.length) {
      return null
    }

    command = binaryName(args[envIndex])
    args = args.slice(envIndex + 1)
  }

  if (command === 'command' || command === 'corepack') {
    if (args.length === 0) {
      return null
    }

    command = binaryName(args[0])
    args = args.slice(1)
  }

  return { args, command }
}

const gitCommand = (args) => {
  let index = 0

  while (index < args.length) {
    const token = args[index]

    if (token === '--') {
      return null
    }

    if (!token.startsWith('-')) {
      return { args: args.slice(index + 1), subcommand: token }
    }

    if (GIT_OPTIONS_WITH_VALUE.has(token)) {
      index += 2
      continue
    }

    if ([...GIT_OPTIONS_WITH_VALUE].some((option) => token.startsWith(`${option}=`))) {
      index += 1
      continue
    }

    index += 1
  }

  return null
}

const hasCombinedFlags = (args, first, second) => {
  let optionCharacters = ''
  let firstLong = false
  let secondLong = false

  for (const token of args) {
    if (token.startsWith('--')) {
      firstLong ||= token === first.long
      secondLong ||= second.long.includes(token)
    } else if (token.startsWith('-')) {
      optionCharacters += token.slice(1)
    }
  }

  return (
    (optionCharacters.includes(first.short) || firstLong) &&
    (second.short.some((flag) => optionCharacters.includes(flag)) || secondLong)
  )
}

const checkGit = (args) => {
  const parsed = gitCommand(args)

  if (!parsed) {
    return null
  }

  const { args: subArgs, subcommand } = parsed

  if (subcommand === 'reset' && subArgs.includes('--hard')) {
    return '파괴적인 Git 명령을 차단했습니다: git reset --hard를 사용하지 마세요.'
  }

  if (subcommand === 'checkout' && subArgs.includes('--')) {
    return '작업 파일을 버릴 수 있는 git checkout -- 명령을 차단했습니다.'
  }

  if (subcommand === 'restore' && !subArgs.includes('--staged')) {
    return '작업 파일을 버릴 수 있는 git restore 명령을 차단했습니다.'
  }

  if (subcommand === 'clean') {
    const isDryRun = subArgs.some((token) => token === '-n' || token === '--dry-run')
    const isForcedDirectoryClean = hasCombinedFlags(
      subArgs,
      { long: '--force', short: 'f' },
      { long: ['--directory'], short: ['d'] },
    )

    if (!isDryRun && isForcedDirectoryClean) {
      return '파일을 삭제하는 강제 git clean 명령을 차단했습니다. 먼저 dry-run으로 범위를 확인하세요.'
    }
  }

  if (
    subcommand === 'push' &&
    subArgs.some(
      (token) =>
        token === '-f' ||
        token === '--force' ||
        token === '--force-with-lease' ||
        token.startsWith('--force-with-lease='),
    )
  ) {
    return 'force push를 차단했습니다. 이력 수정이 필요하면 사용자와 영향을 먼저 확인하세요.'
  }

  return null
}

const checkSegment = (segment, depth) => {
  const commandInfo = effectiveCommand(segment)

  if (!commandInfo) {
    return null
  }

  const { args, command } = commandInfo

  if (BLOCKED_PACKAGE_MANAGERS.has(command)) {
    return `${command} 대신 이 저장소의 패키지 매니저인 pnpm을 사용하세요.`
  }

  if (command === 'git') {
    return checkGit(args)
  }

  if (command === 'rm') {
    const isForcedRecursive = hasCombinedFlags(
      args,
      { long: '--force', short: 'f' },
      { long: ['--recursive', '--dir'], short: ['r', 'R'] },
    )

    if (isForcedRecursive) {
      return '강제 재귀 삭제 명령 rm -rf를 차단했습니다. 명시적인 안전한 대상을 사용하세요.'
    }
  }

  if (depth < 2 && SHELL_WRAPPERS.has(command)) {
    const commandFlagIndex = args.findIndex((token) => /^-[a-zA-Z]*c[a-zA-Z]*$/.test(token))
    const nestedCommand = args[commandFlagIndex + 1]

    if (commandFlagIndex >= 0 && nestedCommand) {
      return evaluateCommand(nestedCommand, depth + 1)
    }
  }

  return null
}

export const evaluateCommand = (command, depth = 0) => {
  if (typeof command !== 'string' || command.trim().length === 0) {
    return null
  }

  for (const segment of commandSegments(tokenizeShell(command))) {
    const reason = checkSegment(segment, depth)

    if (reason) {
      return reason
    }
  }

  return null
}

export const createPreToolUseOutput = (payload) => {
  const toolInput = payload?.tool_input
  const command =
    typeof toolInput?.command === 'string'
      ? toolInput.command
      : typeof toolInput?.cmd === 'string'
        ? toolInput.cmd
        : ''
  const reason = evaluateCommand(command)

  if (!reason) {
    return null
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
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
  const output = createPreToolUseOutput(readPayload())

  if (output) {
    process.stdout.write(`${JSON.stringify(output)}\n`)
  }
}
