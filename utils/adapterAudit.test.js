const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')

const {
  auditAdapters,
  buildMarkdownReport,
  compareAuditResults,
  discoverAdapterEntrypoints,
  parseAdapterArgs,
  writeAuditOutputs,
} = require('./adapterAudit')

test('parseAdapterArgs supports repeated dates and output options', () => {
  const options = parseAdapterArgs([
    'projects/aave/index.js',
    '--date',
    '2024-10-16',
    '--date',
    '1729080692',
    '--date=2025-01-01',
    '--timeout=120000',
    '--markdown',
    'audit.md',
    '--json=audit.json',
    '--compare-base',
    '--base',
    'origin/main',
  ], { allowBase: true })

  assert.deepEqual(options.adapterPaths, ['projects/aave/index.js'])
  assert.deepEqual(options.dates, ['2024-10-16', '1729080692', '2025-01-01'])
  assert.equal(options.timeoutMs, 120000)
  assert.equal(options.markdownPath, 'audit.md')
  assert.equal(options.jsonPath, 'audit.json')
  assert.equal(options.compareBase, true)
  assert.equal(options.baseRef, 'origin/main')
})

test('parseAdapterArgs rejects empty inline option values', () => {
  assert.throws(() => parseAdapterArgs(['--date=']), /--date requires a value/)
  assert.throws(() => parseAdapterArgs(['--markdown=']), /--markdown requires a path/)
  assert.throws(() => parseAdapterArgs(['--json=']), /--json requires a path/)
  assert.throws(() => parseAdapterArgs(['--base='], { allowBase: true }), /--base requires a git ref/)
})

test('parseAdapterArgs rejects flags accidentally consumed as option values', () => {
  assert.throws(() => parseAdapterArgs(['--date', '--compare-base']), /--date requires a value/)
  assert.throws(() => parseAdapterArgs(['--timeout', '--compare-base']), /--timeout requires a value/)
  assert.throws(() => parseAdapterArgs(['--markdown', '--json=audit.json']), /--markdown requires a path/)
  assert.throws(() => parseAdapterArgs(['--json', '--compare-base']), /--json requires a path/)
  assert.throws(() => parseAdapterArgs(['--base', '--compare-base'], { allowBase: true }), /--base requires a git ref/)
})

test('discoverAdapterEntrypoints maps changed project files to runnable adapters', () => {
  const repoRoot = process.cwd()
  const result = discoverAdapterEntrypoints([
    'projects/pangolin/abi.json',
    'projects/aave/v1.js',
    'projects/bitty/ethereum/abi.js',
    path.join(repoRoot, 'projects/treasury/mantadao.js'),
    'projects/helper/chains.json',
  ], repoRoot)

  assert.deepEqual(result.adapters, [
    'projects/aave',
    'projects/bitty',
    'projects/pangolin',
    'projects/treasury/mantadao.js',
  ])
  assert.deepEqual(result.skipped, ['projects/helper/chains.json'])
})

test('discoverAdapterEntrypoints extracts registry adapter keys', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter-audit-'))
  fs.mkdirSync(path.join(repoRoot, 'registries'))
  fs.writeFileSync(path.join(repoRoot, 'registries/new.js'), `
module.exports = {
  'new-adapter': {},
  "another_adapter": {},
}
`)

  const result = discoverAdapterEntrypoints([
    'registries/new.js',
    'registries/index.js',
    'registries/utils.js',
    'registries/deadAdapters.json',
  ], repoRoot)

  assert.deepEqual(result.adapters, ['another_adapter', 'new-adapter'])
  assert.deepEqual(result.skipped, ['registries/deadAdapters.json', 'registries/index.js', 'registries/utils.js'])
})

test('discoverAdapterEntrypoints only extracts added registry keys from tracked diffs', () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'registries'))
  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
module.exports = {
  'removed-adapter': {},
  'kept-adapter': {},
}
`)
  git(repoRoot, ['add', '.'])
  git(repoRoot, ['commit', '-m', 'base'])

  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
module.exports = {
  'kept-adapter': {},
  'added-adapter': {},
}
`)

  const result = discoverAdapterEntrypoints(['registries/example.js'], repoRoot, { baseRef: 'HEAD' })
  assert.deepEqual(result.adapters, ['added-adapter'])
})

test('discoverAdapterEntrypoints extracts edited registry entries when key lines are unchanged', () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'registries'))
  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
const { buildProtocolExports } = require('./utils')

const configs = {
  'edited-adapter': {
    ethereum: { target: '0x111' },
  },
  'unchanged-adapter': {
    ethereum: { target: '0x222' },
  },
}

module.exports = buildProtocolExports(configs, () => ({}))
`)
  git(repoRoot, ['add', '.'])
  git(repoRoot, ['commit', '-m', 'base'])

  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
const { buildProtocolExports } = require('./utils')

const configs = {
  'edited-adapter': {
    ethereum: { target: '0x333' },
  },
  'unchanged-adapter': {
    ethereum: { target: '0x222' },
  },
}

module.exports = buildProtocolExports(configs, () => ({}))
`)

  const result = discoverAdapterEntrypoints(['registries/example.js'], repoRoot, { baseRef: 'HEAD' })
  assert.deepEqual(result.adapters, ['edited-adapter'])
})

test('discoverAdapterEntrypoints ignores helper objects in registry files', () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'registries'))
  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
const { buildProtocolExports } = require('./utils')

const helper = {
  'not-an-adapter': {
    ethereum: { target: '0x111' },
  },
}

const configs = {
  'real-adapter': {
    ethereum: { target: '0x222' },
  },
}

module.exports = buildProtocolExports(configs, () => helper)
`)
  git(repoRoot, ['add', '.'])
  git(repoRoot, ['commit', '-m', 'base'])

  fs.writeFileSync(path.join(repoRoot, 'registries/example.js'), `
const { buildProtocolExports } = require('./utils')

const helper = {
  'not-an-adapter': {
    ethereum: { target: '0x333' },
  },
}

const configs = {
  'real-adapter': {
    ethereum: { target: '0x222' },
  },
}

module.exports = buildProtocolExports(configs, () => helper)
`)

  const result = discoverAdapterEntrypoints(['registries/example.js'], repoRoot, { baseRef: 'HEAD' })
  assert.deepEqual(result.adapters, [])
  assert.deepEqual(result.skipped, ['registries/example.js'])
})

test('buildMarkdownReport includes replay commands and fenced failure output', () => {
  const markdown = buildMarkdownReport({
    generatedAt: '2026-04-28T00:00:00.000Z',
    adapters: ['projects/example/index.js'],
    results: [{
      adapter: 'projects/example/index.js',
      date: 'current',
      status: 'failed',
      durationMs: 1200,
      command: 'node test.js projects/example/index.js',
      stderr: 'Error: bad output with ``` fence',
      stdout: '------ ERROR ------',
    }],
  }, {
    title: 'Changed Adapter Audit',
    baseRef: 'origin/main',
    changedFiles: ['projects/example/index.js'],
  })

  assert.match(markdown, /Changed Adapter Audit/)
  assert.match(markdown, /Changed files: 1/)
  assert.match(markdown, /`node test\.js projects\/example\/index\.js`/)
  assert.match(markdown, /````\nError: bad output with ``` fence\n````/)
})

test('buildMarkdownReport includes successful TVL breakdowns', () => {
  const markdown = buildMarkdownReport({
    generatedAt: '2026-04-28T00:00:00.000Z',
    adapters: ['projects/example/index.js'],
    results: [{
      adapter: 'projects/example/index.js',
      date: 'current',
      status: 'passed',
      durationMs: 900,
      command: 'node test.js projects/example/index.js',
      totalTvl: '1.50m',
      totalTvlValue: 1_500_000,
      tvlSummary: {
        byKey: {
          ethereum: { display: '1.00m', value: 1_000_000 },
          staking: { display: '500k', value: 500_000 },
        },
      },
    }],
  })

  assert.match(markdown, /## TVL Breakdowns/)
  assert.match(markdown, /<summary>projects\/example\/index\.js \(current\)<\/summary>/)
  assert.match(markdown, /\| ethereum \| 1\.00m \|/)
  assert.match(markdown, /\| total \| 1\.50m \|/)
})

test('buildMarkdownReport caps oversized markdown comments', () => {
  const byKey = {}
  for (let i = 0; i < 10000; i++)
    byKey[`chain-${i}`] = { display: `${i}`, value: i }

  const markdown = buildMarkdownReport({
    generatedAt: '2026-04-28T00:00:00.000Z',
    adapters: ['projects/example/index.js'],
    results: [{
      adapter: 'projects/example/index.js',
      date: 'current',
      status: 'passed',
      durationMs: 900,
      command: 'node test.js projects/example/index.js',
      totalTvl: '1.50m',
      totalTvlValue: 1_500_000,
      tvlSummary: { byKey },
    }],
  })

  assert.ok(markdown.length <= 60000)
  assert.match(markdown, /Report truncated to stay under GitHub's PR comment size limit/)
  assert.match(markdown, /JSON artifact contains the full audit output/)
})

test('writeAuditOutputs creates parent directories for artifacts', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter-audit-'))
  const auditResult = {
    repoRoot,
    generatedAt: '2026-04-28T00:00:00.000Z',
    adapters: [],
    results: [],
    skipped: [],
  }

  writeAuditOutputs(auditResult, {
    markdownPath: 'nested/comments/adapter-audit.md',
    jsonPath: 'nested/results/adapter-audit.json',
  })

  assert.match(fs.readFileSync(path.join(repoRoot, 'nested/comments/adapter-audit.md'), 'utf8'), /Adapter Audit/)
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(repoRoot, 'nested/results/adapter-audit.json'), 'utf8')).results,
    [],
  )
})

test('compareAuditResults reports base-to-head TVL deltas', () => {
  const comparisons = compareAuditResults([{
    adapter: 'projects/example/index.js',
    date: 'current',
    status: 'passed',
    totalTvl: '1.50m',
    totalTvlValue: 1_500_000,
  }], [{
    adapter: 'projects/example/index.js',
    date: 'current',
    status: 'passed',
    totalTvl: '1.00m',
    totalTvlValue: 1_000_000,
  }])

  assert.deepEqual(comparisons, [{
    adapter: 'projects/example/index.js',
    date: 'current',
    headStatus: 'passed',
    baseStatus: 'passed',
    headTotalTvl: '1.50m',
    baseTotalTvl: '1.00m',
    status: 'changed',
    delta: 500_000,
    deltaPct: 50,
  }])
})

test('auditAdapters compares against a base worktree and cleans it up', async () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'projects/example'), { recursive: true })
  fs.writeFileSync(path.join(repoRoot, 'projects/example/index.js'), 'module.exports = {}')
  fs.writeFileSync(path.join(repoRoot, 'test.js'), `
console.log('------ TVL ------')
console.log('total                    1.00m')
`)
  git(repoRoot, ['add', '.'])
  git(repoRoot, ['commit', '-m', 'base'])

  fs.writeFileSync(path.join(repoRoot, 'test.js'), `
console.log('------ TVL ------')
console.log('total                    1.50m')
`)

  const result = await auditAdapters(['projects/example'], {
    repoRoot,
    baseRef: 'HEAD',
    compareBase: true,
    timeoutMs: 10000,
  })

  assert.equal(result.results[0].totalTvl, '1.50m')
  assert.equal(result.baseResults[0].totalTvl, '1.00m')
  assert.equal(result.comparisons[0].delta, 500_000)
  assert.equal(git(repoRoot, ['worktree', 'list']).includes('adapter-audit-base-'), false)
})

test('auditAdapters reports timed out child processes', async () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'projects/example'), { recursive: true })
  fs.writeFileSync(path.join(repoRoot, 'projects/example/index.js'), 'module.exports = {}')
  fs.writeFileSync(path.join(repoRoot, 'test.js'), 'setTimeout(() => {}, 10000)')

  const result = await auditAdapters(['projects/example'], {
    repoRoot,
    timeoutMs: 50,
  })

  assert.equal(result.results[0].status, 'timeout')
})

test('auditAdapters truncates noisy adapter output', async () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'projects/example'), { recursive: true })
  fs.writeFileSync(path.join(repoRoot, 'projects/example/index.js'), 'module.exports = {}')
  fs.writeFileSync(path.join(repoRoot, 'test.js'), `
process.stdout.write('x'.repeat(150000))
process.exitCode = 1
`)

  const result = await auditAdapters(['projects/example'], {
    repoRoot,
    timeoutMs: 10000,
  })

  assert.equal(result.results[0].status, 'failed')
  assert.match(result.results[0].stdout, /\[adapter-audit: output truncated\]/)
  assert.ok(result.results[0].stdout.length <= 120000)
})

test('auditChangedAdapters writes a report when changed files map to no adapters', () => {
  const repoRoot = createGitRepo()
  fs.mkdirSync(path.join(repoRoot, 'projects/helper'), { recursive: true })
  fs.writeFileSync(path.join(repoRoot, 'projects/helper/chains.json'), '{"ethereum":1}\n')
  git(repoRoot, ['add', '.'])
  git(repoRoot, ['commit', '-m', 'base'])

  fs.writeFileSync(path.join(repoRoot, 'projects/helper/chains.json'), '{"ethereum":1,"base":1}\n')
  const markdownPath = path.join(repoRoot, 'adapter-audit.md')
  const jsonPath = path.join(repoRoot, 'adapter-audit.json')
  const stdout = execFileSync(process.execPath, [
    path.join(__dirname, 'auditChangedAdapters.js'),
    '--base',
    'HEAD',
    '--markdown',
    markdownPath,
    '--json',
    jsonPath,
  ], {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  assert.match(stdout, /Adapters: 0/)
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /Skipped Changed Files/)
  const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  assert.deepEqual(report.adapters, [])
  assert.deepEqual(report.skipped, ['projects/helper/chains.json'])
})

function createGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter-audit-'))
  git(repoRoot, ['init'])
  return repoRoot
}

function git(repoRoot, args) {
  return execFileSync('git', ['-c', 'user.name=adapter-audit-test', '-c', 'user.email=adapter-audit-test@example.com', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
}
