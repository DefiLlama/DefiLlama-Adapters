const assert = require('node:assert/strict')
const { execFileSync, spawnSync } = require('node:child_process')
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const script = path.join(__dirname, 'checkNewGetLogs.js')

function fixture(t, before, after, file = 'projects/example/index.js') {
  const cwd = mkdtempSync(path.join(tmpdir(), 'llama-getlogs-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
  git('init', '--quiet')
  const target = path.join(cwd, file)
  mkdirSync(path.dirname(target), { recursive: true })
  if (before !== null) writeFileSync(target, before)
  const commit = () => {
    git('add', '.')
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
      '-c', 'commit.gpgsign=false', 'commit', '--quiet', '--allow-empty', '-m', 'Fixture')
    return git('rev-parse', 'HEAD')
  }
  const base = commit()
  writeFileSync(target, after)
  const head = commit()
  return { cwd, base, head, target, git, commit }
}

function run({ cwd, base, head }) {
  return spawnSync(process.execPath, [script, base, head], { cwd, encoding: 'utf8' })
}

const allowed = [
  ['line comment from issue #20540', '// يمكنك استخدام api.getLogs() لتتبع أحداث معينة\n'],
  ['block comment', '/*\n api.getLogs()\n*/\n'],
  ['quoted string', 'const example = "api.getLogs()"\n'],
  ['template text', 'const example = `api.getLogs()`\n'],
  ['regular expression', 'const example = /api.getLogs()/\n'],
  ['recommended helper', 'getLogs2({ api })\n'],
  ['another receiver', 'other.getLogs()\n'],
  ['method reference', 'const read = api.getLogs\n'],
]

for (const [name, source] of allowed) {
  test(`allows ${name}`, t => {
    const result = run(fixture(t, '', source))
    assert.equal(result.status, 0, result.stdout + result.stderr)
  })
}

const forbidden = [
  ['direct call', 'api.getLogs({})\n'],
  ['multiline member', 'api\n  .getLogs({})\n'],
  ['multiline call', 'api.getLogs\n  ({})\n'],
  ['optional call', 'api?.getLogs?.({})\n'],
  ['computed method', 'api["getLogs"]({})\n'],
  ['static template method', 'api[`getLogs`]({})\n'],
  ['template interpolation', 'const example = `${api.getLogs({})}`\n'],
  ['call following a comment', '/* explanation */ api.getLogs({})\n'],
  ['inline suppression', '/* eslint-disable */\napi.getLogs({})\n'],
]

for (const [name, source] of forbidden) {
  test(`rejects ${name}`, t => {
    const result = run(fixture(t, '', source))
    assert.equal(result.status, 1)
    assert.match(result.stdout + result.stderr, /projects\/example\/index\.js:\d+:\d+/)
    assert.match(result.stdout + result.stderr, /getLogs2/)
  })
}

test('does not reject an unchanged legacy call when arguments change', t => {
  const result = run(fixture(t, 'api.getLogs({\n  fromBlock: 1,\n})\n',
    'api.getLogs({\n  fromBlock: 2,\n})\n'))
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('rejects turning an existing method reference into a call on a new line', t => {
  const result = run(fixture(t, 'api.getLogs\n', 'api.getLogs\n({})\n'))
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /getLogs2/)
})

test('checks newly added adapter files', t => {
  const result = run(fixture(t, null, 'api.getLogs({})\n'))
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /getLogs2/)
})

test('ignores deleted adapter files', t => {
  const repo = fixture(t, '', 'api.getLogs({})\n')
  repo.base = repo.head
  rmSync(repo.target)
  repo.head = repo.commit()
  const result = run(repo)
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('does not reject an unchanged call when a comment is inserted in its callee', t => {
  const result = run(fixture(t, 'api\n  .getLogs({})\n',
    'api\n  /* api.getLogs() */\n  .getLogs({})\n'))
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('finds calls in later diff hunks and reports head line numbers', t => {
  const unchanged = '\n'.repeat(20)
  const result = run(fixture(t, `const n = 1\n${unchanged}getLogs2({})\n`,
    `const n = 2\n${unchanged}api.getLogs({})\n`))
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /index\.js:22:1/)
})

test('ignores deleted calls', t => {
  const result = run(fixture(t, 'api.getLogs({})\n', 'getLogs2({ api })\n'))
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('reads the requested head revision, not the working tree', t => {
  const repo = fixture(t, '', 'api.getLogs({})\n')
  writeFileSync(repo.target, 'getLogs2({ api })\n')
  const result = run(repo)
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /getLogs2/)
})

test('handles paths containing spaces', t => {
  const result = run(fixture(t, '', 'api.getLogs({})\n', 'projects/example name/index.js'))
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /projects\/example name\/index\.js:1:1/)
})

test('ignores files outside the adapter JavaScript scope', t => {
  const result = run(fixture(t, '', 'api.getLogs({})\n', 'scripts/example.js'))
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('fails on invalid JavaScript instead of silently passing it', t => {
  const result = run(fixture(t, '', 'api.getLogs(\n'))
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /Parsing error/)
})

test('fails when the comparison revision is unavailable', t => {
  const repo = fixture(t, '', '// comment\n')
  const result = run({ ...repo, base: '0'.repeat(40) })
  assert.equal(result.status, 1)
  assert.match(result.stdout + result.stderr, /ERROR/)
})
