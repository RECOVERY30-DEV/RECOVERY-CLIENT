import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  REQUIRED_PATHS,
  collectHarnessErrors,
} from './check-harness.mjs'

const requiredFiles = {
  'AGENTS.md': [
    '# AGENTS',
    '`docs/agent/working-agreement.md`',
    '`docs/rules/project.md`',
    '`.agents/checklists/pre-work.md`',
    '`docs/conventions/code.md`',
    '`docs/conventions/commit.md`',
    '`docs/conventions/pull-request.md`',
  ].join('\n'),
  '.agents/README.md': '# Agent Harness',
  '.agents/checklists/final-report.md': '# Final Report Checklist',
  '.agents/checklists/pre-work.md': '# Pre-work Checklist',
  '.agents/checklists/verification.md': '# Verification Checklist',
  '.agents/recipes/skeptical-pr-review.md': '# Skeptical PR Review Recipe',
  '.agents/scripts/check-harness.mjs': '// harness checker\n',
  '.agents/scripts/harness.test.mjs': '// harness tests\n',
  '.codex/hooks.json': '{"hooks":{}}\n',
  '.codex/hooks/hooks.test.mjs': '// hook tests\n',
  '.codex/hooks/session-start.mjs': '// session hook\n',
  '.codex/hooks/shell-guard.mjs': '// shell guard\n',
  'docs/agent/harness.md': '# Agent Harness',
  'docs/agent/working-agreement.md': '# Working Agreement',
  'docs/conventions/code.md': '# Code Convention',
  'docs/conventions/commit.md': '# Commit Convention',
  'docs/conventions/git.md': '# Git Convention',
  'docs/conventions/pull-request.md': '# Pull Request Convention',
  'docs/rules/project.md': '# Project Rules',
  'docs/workflows/verification.md': '# Verification',
  'package.json': JSON.stringify({
    scripts: {
      'check:harness': 'node .agents/scripts/check-harness.mjs',
      'test:harness': 'node --test .agents/scripts/harness.test.mjs',
      'test:hooks': 'node --test .codex/hooks/hooks.test.mjs',
      typecheck: 'tsc --noEmit',
    },
  }),
}

const createFixture = async (overrides = {}) => {
  const root = await mkdtemp(path.join(tmpdir(), 'recovery-harness-'))
  const files = { ...requiredFiles, ...overrides }

  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      if (content === null) {
        return
      }

      const filePath = path.join(root, relativePath)
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, content)
    }),
  )

  return root
}

const withFixture = async (overrides, run) => {
  const root = await createFixture(overrides)

  try {
    await run(root)
  } finally {
    await rm(root, { force: true, recursive: true })
  }
}

test('accepts a complete minimal harness', async () => {
  await withFixture({}, async (root) => {
    assert.deepEqual(await collectHarnessErrors(root), [])
  })
})

test('requires code, commit, and pull request convention documents', () => {
  for (const relativePath of [
    'docs/conventions/code.md',
    'docs/conventions/commit.md',
    'docs/conventions/pull-request.md',
  ]) {
    assert.ok(
      REQUIRED_PATHS.includes(relativePath),
      `expected required path: ${relativePath}`,
    )
  }
})

test('reports missing required convention routes from AGENTS.md', async () => {
  await withFixture(
    {
      'AGENTS.md': [
        '# AGENTS',
        '`docs/agent/working-agreement.md`',
        '`docs/rules/project.md`',
        '`.agents/checklists/pre-work.md`',
      ].join('\n'),
    },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      for (const relativePath of [
        'docs/conventions/code.md',
        'docs/conventions/commit.md',
        'docs/conventions/pull-request.md',
      ]) {
        assert.ok(
          errors.some((error) => error.includes(relativePath)),
          `expected missing route error: ${relativePath}`,
        )
      }
    },
  )
})

test('rejects AGENTS.md files longer than 100 lines', async () => {
  await withFixture(
    {
      'AGENTS.md': Array.from({ length: 101 }, (_, index) =>
        index === 0 ? '# AGENTS' : `line ${index + 1}`,
      ).join('\n'),
    },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      assert.ok(errors.some((error) => error.includes('100줄')))
    },
  )
})

test('reports missing required harness files with the exact path', async () => {
  await withFixture(
    { 'docs/rules/project.md': null },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      assert.ok(errors.some((error) => error.includes('docs/rules/project.md')))
    },
  )
})

test('reports broken local paths routed from AGENTS.md', async () => {
  await withFixture(
    {
      'AGENTS.md': `${requiredFiles['AGENTS.md']}\n\`docs/rules/missing.md\``,
    },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      assert.ok(errors.some((error) => error.includes('docs/rules/missing.md')))
    },
  )
})

test('rejects invalid hook configuration JSON', async () => {
  await withFixture(
    { '.codex/hooks.json': '{invalid' },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      assert.ok(errors.some((error) => error.includes('.codex/hooks.json')))
    },
  )
})

test('reports missing harness package scripts', async () => {
  await withFixture(
    { 'package.json': JSON.stringify({ scripts: {} }) },
    async (root) => {
      const errors = await collectHarnessErrors(root)

      assert.ok(errors.some((error) => error.includes('check:harness')))
    },
  )
})
