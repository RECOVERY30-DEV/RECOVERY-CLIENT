import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { PRIMER, createSessionStartOutput } from './session-start.mjs'
import { createPreToolUseOutput, evaluateCommand, tokenizeShell } from './shell-guard.mjs'

const runHook = (scriptName, payload) =>
  spawnSync(process.execPath, [fileURLToPath(new URL(scriptName, import.meta.url))], {
    encoding: 'utf8',
    input: JSON.stringify(payload),
  })

test('session primer stays short and routes agents to project instructions', () => {
  const lines = PRIMER.trim().split('\n')

  assert.ok(lines.length <= 10)
  assert.match(PRIMER, /AGENTS\.md/)
  assert.match(PRIMER, /working-agreement\.md/)
  assert.match(PRIMER, /project\.md/)
})

test('session hook injects context only inside the repository', () => {
  const repoRoot = '/workspace/recovery-client'
  const inside = createSessionStartOutput({ cwd: '/workspace/recovery-client/src/app' }, repoRoot)
  const outside = createSessionStartOutput({ cwd: '/workspace/other' }, repoRoot)

  assert.equal(inside.hookSpecificOutput.hookEventName, 'SessionStart')
  assert.equal(inside.hookSpecificOutput.additionalContext, PRIMER)
  assert.equal(outside, null)
})

test('tokenizes quoted arguments and compound shell commands', () => {
  assert.deepEqual(tokenizeShell('pnpm exec "next build" && git status'), [
    'pnpm',
    'exec',
    'next build',
    '&&',
    'git',
    'status',
  ])
})

test('blocks package managers that are not pnpm', () => {
  for (const command of [
    'npm install',
    'npx eslint .',
    'yarn add zod',
    'bun install',
    'corepack npm install',
    'env NODE_ENV=test npm install',
    'command npm install',
    'bash -lc "npm install"',
    'git status && npm test',
  ]) {
    assert.match(evaluateCommand(command), /pnpm/)
  }
})

test('blocks destructive Git commands', () => {
  for (const command of [
    'git reset --hard',
    'git checkout -- src/app/page.tsx',
    'git clean -fd',
    'git clean --force --directory',
    'git push --force origin feature',
    'git push --force-with-lease origin feature',
    'git restore src/app/page.tsx',
  ]) {
    assert.ok(evaluateCommand(command), `expected block: ${command}`)
  }
})

test('blocks recursive forced deletion', () => {
  assert.match(evaluateCommand('rm -rf build'), /rm/)
  assert.match(evaluateCommand('rm --recursive --force build'), /rm/)
})

test('allows safe project commands', () => {
  for (const command of [
    'pnpm install --frozen-lockfile',
    'pnpm build',
    'git status --short --branch',
    'git clean -nd',
    'git restore --staged src/app/page.tsx',
    'rm temporary-file.txt',
  ]) {
    assert.equal(evaluateCommand(command), null, `expected allow: ${command}`)
  }
})

test('returns a Codex denial payload with the remediation reason', () => {
  const output = createPreToolUseOutput({
    tool_input: { command: 'npm install' },
  })

  assert.equal(output.hookSpecificOutput.permissionDecision, 'deny')
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /pnpm/)
})

test('returns no payload for safe or missing commands', () => {
  assert.equal(createPreToolUseOutput({ tool_input: { command: 'pnpm build' } }), null)
  assert.equal(createPreToolUseOutput({}), null)
})

test('session hook CLI reads stdin and writes a valid hook payload', () => {
  const result = runHook('./session-start.mjs', {
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
  })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.hookEventName, 'SessionStart')
})

test('shell guard CLI denies blocked commands from stdin', () => {
  const result = runHook('./shell-guard.mjs', {
    tool_input: { command: 'npm install' },
  })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.permissionDecision, 'deny')
})

test('shell guard CLI stays silent for allowed commands', () => {
  const result = runHook('./shell-guard.mjs', {
    tool_input: { command: 'pnpm build' },
  })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, '')
})
