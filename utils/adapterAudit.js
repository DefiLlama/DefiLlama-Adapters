const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn, execFileSync } = require('child_process')

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000
const DEFAULT_OUTPUT_LIMIT = 120000
const MAX_MARKDOWN_REPORT_LENGTH = 60000

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/').replace(/\\/g, '/')
}

function getRepoRoot(start = process.cwd()) {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: start,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch (_) {
    return start
  }
}

function parsePositiveInteger(value, label) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0)
    throw new Error(`${label} must be a positive integer, got: ${value}`)
  return parsed
}

function parseRequiredOptionValue(value, option, label = 'value') {
  if (!value) throw new Error(`${option} requires a ${label}`)
  return value
}

function normalizeAdapterPath(adapterPath, repoRoot) {
  if (/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(adapterPath))
    return adapterPath

  const absolutePath = path.resolve(repoRoot, adapterPath)
  const relativePath = toPosixPath(path.relative(repoRoot, absolutePath))

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath))
    throw new Error(`Adapter path must be inside the repository: ${adapterPath}`)

  if (!relativePath.startsWith('projects/'))
    throw new Error(`Adapter path must be under projects/: ${adapterPath}`)

  if (!fs.existsSync(absolutePath))
    throw new Error(`Adapter file does not exist: ${relativePath}`)

  const stat = fs.statSync(absolutePath)
  if (!relativePath.endsWith('.js') && !stat.isDirectory())
    throw new Error(`Adapter path must be a JavaScript file or project directory: ${relativePath}`)

  return relativePath
}

function parseAdapterArgs(argv, { allowBase = false } = {}) {
  const options = {
    adapterPaths: [],
    dates: [],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    markdownPath: undefined,
    jsonPath: undefined,
    baseRef: 'origin/main',
    compareBase: false,
    help: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }

    if (arg === '--date') {
      options.dates.push(parseRequiredOptionValue(argv[++i], '--date'))
      continue
    }

    if (arg.startsWith('--date=')) {
      options.dates.push(parseRequiredOptionValue(arg.slice('--date='.length), '--date'))
      continue
    }

    if (arg === '--timeout') {
      options.timeoutMs = parsePositiveInteger(argv[++i], '--timeout')
      continue
    }

    if (arg.startsWith('--timeout=')) {
      options.timeoutMs = parsePositiveInteger(arg.slice('--timeout='.length), '--timeout')
      continue
    }

    if (arg === '--markdown') {
      options.markdownPath = parseRequiredOptionValue(argv[++i], '--markdown', 'path')
      continue
    }

    if (arg.startsWith('--markdown=')) {
      options.markdownPath = parseRequiredOptionValue(arg.slice('--markdown='.length), '--markdown', 'path')
      continue
    }

    if (arg === '--json') {
      options.jsonPath = parseRequiredOptionValue(argv[++i], '--json', 'path')
      continue
    }

    if (arg.startsWith('--json=')) {
      options.jsonPath = parseRequiredOptionValue(arg.slice('--json='.length), '--json', 'path')
      continue
    }

    if (arg === '--compare-base') {
      options.compareBase = true
      continue
    }

    if (allowBase && arg === '--base') {
      options.baseRef = parseRequiredOptionValue(argv[++i], '--base', 'git ref')
      continue
    }

    if (allowBase && arg.startsWith('--base=')) {
      options.baseRef = parseRequiredOptionValue(arg.slice('--base='.length), '--base', 'git ref')
      continue
    }

    if (arg.startsWith('-'))
      throw new Error(`Unknown option: ${arg}`)

    options.adapterPaths.push(arg)
  }

  options.dates = Array.from(new Set(options.dates))
  return options
}

function getChangedFiles(baseRef, repoRoot) {
  try {
    const committed = getGitLines(['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`, '--', 'projects', 'registries'], repoRoot)
    const staged = getGitLines(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', 'projects', 'registries'], repoRoot)
    const unstaged = getGitLines(['diff', '--name-only', '--diff-filter=ACMR', '--', 'projects', 'registries'], repoRoot)
    const untracked = getGitLines(['ls-files', '--others', '--exclude-standard', '--', 'projects', 'registries'], repoRoot)

    return Array.from(new Set([...committed, ...staged, ...unstaged, ...untracked])).sort()
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : ''
    const suffix = stderr ? `\n${stderr}` : ''
    throw new Error(`Unable to diff against ${baseRef}.${suffix}`)
  }
}

function getGitLines(args, repoRoot) {
  const output = execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

function discoverAdapterEntrypoints(files, repoRoot, { baseRef = 'HEAD~1' } = {}) {
  const adapters = new Set()
  const skipped = []

  files.forEach((file) => {
    const relativePath = toPosixPath(path.isAbsolute(file) ? path.relative(repoRoot, file) : file)
    const parts = relativePath.split('/')

    if (parts[0] === 'registries') {
      discoverRegistryKeys(relativePath, repoRoot, baseRef).forEach((key) => adapters.add(key))
      return
    }

    if (parts[0] !== 'projects' || parts.length < 2) return
    if (parts[1] === 'helper' || parts[1] === 'config') {
      skipped.push(relativePath)
      return
    }

    if (parts[1] === 'treasury' || parts[1] === 'entities') {
      adapters.add(relativePath)
      return
    }

    adapters.add(`projects/${parts[1]}`)
  })

  return {
    adapters: Array.from(adapters).sort(),
    skipped: Array.from(new Set(skipped)).sort(),
  }
}

function discoverRegistryKeys(file, repoRoot, baseRef) {
  const parts = file.split('/')
  const basename = parts[1]

  if (parts.length !== 2 || !file.endsWith('.js') || basename === 'index.js' || basename === 'utils.js')
    return []

  if (!isTrackedFile(file, repoRoot))
    return getRegistryKeysFromFile(file, repoRoot)

  return getChangedRegistryKeys(file, repoRoot, baseRef)
}

function isTrackedFile(file, repoRoot) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', file], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'ignore'],
    })
    return true
  } catch (_) {
    return false
  }
}

function getChangedRegistryKeys(file, repoRoot, baseRef) {
  const currentEntries = getRegistryEntriesFromFile(file, repoRoot)
  const baseEntries = getRegistryEntriesFromGit(file, repoRoot, baseRef)

  return Array.from(currentEntries)
    .filter(([key, source]) => baseEntries.get(key) !== source)
    .map(([key]) => key)
}

function getRegistryEntriesFromGit(file, repoRoot, ref) {
  try {
    const source = execFileSync('git', ['show', `${ref}:${file}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return getRegistryEntriesFromSource(source)
  } catch (_) {
    return new Map()
  }
}

function getRegistryKeysFromFile(file, repoRoot) {
  return Array.from(getRegistryEntriesFromFile(file, repoRoot).keys())
}

function getRegistryEntriesFromFile(file, repoRoot) {
  const fullPath = path.join(repoRoot, file)
  if (!fs.existsSync(fullPath)) return new Map()

  return getRegistryEntriesFromSource(fs.readFileSync(fullPath, 'utf8'))
}

function getRegistryEntriesFromSource(source) {
  const lines = source.split(/\r?\n/)
  const entries = new Map()
  let depth = 0
  let entryDepth
  let current

  lines.forEach((line, index) => {
    const key = extractRegistryKey(line)
    if (!current && key && depth > 0 && (entryDepth === undefined || depth === entryDepth)) {
      entryDepth = depth
      current = { key, start: index, depth }
    }

    const nextDepth = Math.max(0, depth + getBraceDelta(line))
    if (current && nextDepth <= current.depth) {
      entries.set(current.key, lines.slice(current.start, index + 1).join('\n'))
      current = undefined
    }
    depth = nextDepth
  })

  if (current)
    entries.set(current.key, lines.slice(current.start).join('\n'))

  return entries
}

function extractRegistryKey(line) {
  const match = line.match(/['"]([a-zA-Z0-9][a-zA-Z0-9_-]+)['"]\s*:/)
  return match?.[1]
}

function getBraceDelta(line) {
  let delta = 0
  for (const char of line) {
    if (char === '{') delta++
    else if (char === '}') delta--
  }
  return delta
}

function appendLimited(existing, nextChunk, limit) {
  if (!nextChunk) return existing
  let output = existing + nextChunk
  if (output.length <= limit) return output

  const marker = '\n[adapter-audit: output truncated]\n'
  if (limit <= marker.length)
    return output.slice(-limit)
  output = output.slice(output.length - limit + marker.length)
  return marker + output
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function buildCommand(adapterPath, date) {
  return ['node', 'test.js', adapterPath, date].filter(Boolean).join(' ')
}

function extractTvlSummary(output) {
  const lines = output.split(/\r?\n/)
  const tvlIndex = lines.findIndex((line) => line.includes('------ TVL ------'))
  if (tvlIndex === -1) return {}

  const byKey = {}
  let total

  lines.slice(tvlIndex + 1).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    const match = trimmed.match(/^(.+?)\s+([-+]?\d[\d,.]*(?:\.\d+)?\s*[a-zA-Z]*)$/)
    if (!match) return

    const key = match[1].trim()
    const value = match[2].trim()
    const parsed = parseHumanNumber(value)

    if (key.toLowerCase() === 'total') {
      total = { display: value, value: parsed }
      return
    }

    byKey[key] = { display: value, value: parsed }
  })

  return { total, byKey }
}

function parseHumanNumber(value) {
  if (!value) return undefined
  const match = String(value).trim().toLowerCase().replace(/,/g, '').match(/^([-+]?\d+(?:\.\d+)?)\s*([kmbt])?$/)
  if (!match) return undefined

  const multipliers = {
    k: 1e3,
    m: 1e6,
    b: 1e9,
    t: 1e12,
  }

  return Number(match[1]) * (multipliers[match[2]] || 1)
}

function tailLines(output, maxLines = 40) {
  const lines = output.split(/\r?\n/)
  return lines.slice(Math.max(0, lines.length - maxLines)).join('\n').trim()
}

function fencedBlock(content) {
  if (!content) return []
  let fence = '```'
  while (content.includes(fence))
    fence += '`'
  return [fence, content, fence]
}

function runAdapter(adapterPath, date, options) {
  return new Promise((resolve) => {
    const args = ['test.js', adapterPath]
    if (date) args.push(date)

    const startedAt = Date.now()
    const child = spawn(process.execPath, args, {
      cwd: options.repoRoot,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false
    let settled = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
      setTimeout(() => {
        if (!settled) child.kill('SIGKILL')
      }, 5000).unref()
    }, options.timeoutMs)

    child.stdout.on('data', (chunk) => {
      stdout = appendLimited(stdout, chunk.toString(), options.outputLimit)
    })

    child.stderr.on('data', (chunk) => {
      stderr = appendLimited(stderr, chunk.toString(), options.outputLimit)
    })

    child.on('error', (error) => {
      settled = true
      clearTimeout(timer)
      const durationMs = Date.now() - startedAt
      resolve({
        adapter: adapterPath,
        date: date || 'current',
        command: buildCommand(adapterPath, date),
        status: 'failed',
        exitCode: undefined,
        durationMs,
        error: error.message,
        stdout,
        stderr,
      })
    })

    child.on('close', (exitCode, signal) => {
      settled = true
      clearTimeout(timer)
      const durationMs = Date.now() - startedAt
      const status = timedOut ? 'timeout' : exitCode === 0 ? 'passed' : 'failed'
      const tvlSummary = status === 'passed' ? extractTvlSummary(stdout) : {}
      resolve({
        adapter: adapterPath,
        date: date || 'current',
        command: buildCommand(adapterPath, date),
        status,
        exitCode,
        signal,
        durationMs,
        totalTvl: tvlSummary.total?.display,
        totalTvlValue: tvlSummary.total?.value,
        tvlSummary,
        stdout,
        stderr,
      })
    })
  })
}

async function runWithConcurrency(items, concurrency, processor) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++
      results[currentIndex] = await processor(items[currentIndex])
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return results
}

async function auditAdapters(adapterPaths, options) {
  const repoRoot = options.repoRoot || getRepoRoot()
  const normalizedAdapters = Array.from(new Set(adapterPaths.map((adapterPath) => normalizeAdapterPath(adapterPath, repoRoot)))).sort()
  const dates = [undefined, ...(options.dates || [])]

  const runs = normalizedAdapters.flatMap((adapterPath) => dates.map((date) => ({ adapterPath, date })))
  const results = await runWithConcurrency(runs, 1, (run) => runAdapter(run.adapterPath, run.date, {
    repoRoot,
    timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
    outputLimit: DEFAULT_OUTPUT_LIMIT,
  }))

  const auditResult = {
    generatedAt: new Date().toISOString(),
    repoRoot,
    adapters: normalizedAdapters,
    results,
  }

  if (options.compareBase) {
    const baseRef = options.baseRef || 'origin/main'
    auditResult.baseRef = baseRef
    auditResult.baseResults = await runBaseAdapterSet(runs, {
      repoRoot,
      baseRef,
      timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
      outputLimit: DEFAULT_OUTPUT_LIMIT,
    })
    auditResult.comparisons = compareAuditResults(results, auditResult.baseResults)
  }

  return auditResult
}

async function runBaseAdapterSet(runs, options) {
  const worktreePath = createBaseWorktree(options.repoRoot, options.baseRef)

  try {
    // CI rejects package and lockfile edits, so the base worktree can share the checked-out branch's dependencies.
    const nodePath = [
      path.join(options.repoRoot, 'node_modules'),
      process.env.NODE_PATH,
    ].filter(Boolean).join(path.delimiter)

    return await runWithConcurrency(runs, 1, (run) => runAdapter(run.adapterPath, run.date, {
      repoRoot: worktreePath,
      timeoutMs: options.timeoutMs,
      outputLimit: options.outputLimit,
      env: { NODE_PATH: nodePath },
    }))
  } finally {
    removeBaseWorktree(options.repoRoot, worktreePath)
  }
}

function createBaseWorktree(repoRoot, baseRef) {
  const worktreePath = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter-audit-base-'))

  try {
    execFileSync('git', ['worktree', 'add', '--detach', worktreePath, baseRef], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
    })
  } catch (error) {
    fs.rmSync(worktreePath, { recursive: true, force: true })
    const stderr = error.stderr ? String(error.stderr).trim() : ''
    const suffix = stderr ? `\n${stderr}` : ''
    throw new Error(`Unable to create base worktree for ${baseRef}.${suffix}`)
  }

  return worktreePath
}

function removeBaseWorktree(repoRoot, worktreePath) {
  try {
    execFileSync('git', ['worktree', 'remove', '--force', worktreePath], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'ignore'],
    })
  } catch (_) {
    fs.rmSync(worktreePath, { recursive: true, force: true })
  }
}

function compareAuditResults(headResults, baseResults) {
  const baseByRun = new Map(baseResults.map((result) => [getRunKey(result), result]))

  return headResults.map((head) => {
    const base = baseByRun.get(getRunKey(head))
    const comparison = {
      adapter: head.adapter,
      date: head.date,
      headStatus: head.status,
      baseStatus: base?.status || 'missing',
      headTotalTvl: head.totalTvl,
      baseTotalTvl: base?.totalTvl,
      status: 'not_comparable',
    }

    if (head.status !== 'passed' || base?.status !== 'passed')
      return comparison

    const headValue = head.totalTvlValue
    const baseValue = base.totalTvlValue

    if (!Number.isFinite(headValue) || !Number.isFinite(baseValue))
      return comparison

    const delta = headValue - baseValue
    comparison.delta = delta
    comparison.deltaPct = baseValue === 0 ? undefined : delta / baseValue * 100
    comparison.status = Math.abs(delta) < 1 ? 'unchanged' : 'changed'
    return comparison
  })
}

function getRunKey(result) {
  return `${result.adapter}\n${result.date}`
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return ''
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return ''
  return `${value >= 0 ? '+' : ''}${Math.round(value).toLocaleString('en-US')}`
}

function buildMarkdownReport(auditResult, { title = 'Adapter Audit', baseRef, changedFiles, skipped = [] } = {}) {
  const results = auditResult.results || []
  const failed = results.filter((result) => result.status !== 'passed')
  const comparisons = auditResult.comparisons || []
  baseRef = baseRef || auditResult.baseRef
  const rows = results.map((result) => [
    result.adapter,
    result.date,
    result.status,
    formatDuration(result.durationMs),
    result.totalTvl || '',
    `\`${result.command}\``,
  ])

  const lines = [
    `# ${title}`,
    '',
    `Generated: ${auditResult.generatedAt}`,
  ]

  if (baseRef)
    lines.push(`Base ref: \`${baseRef}\``)
  if (changedFiles)
    lines.push(`Changed files: ${changedFiles.length}`)

  lines.push(
    '',
    `Adapters: ${auditResult.adapters.length}`,
    `Runs: ${results.length}`,
    `Passed: ${results.length - failed.length}`,
    `Failed: ${failed.length}`,
    '',
    '| Adapter | Run | Status | Duration | Total TVL | Replay |',
    '| --- | --- | --- | ---: | ---: | --- |',
  )

  if (rows.length === 0) {
    lines.push('| n/a | n/a | skipped | n/a | n/a | n/a |')
  } else {
    rows.forEach((row) => {
      lines.push(`| ${row.join(' | ')} |`)
    })
  }

  if (skipped.length) {
    lines.push('', '## Skipped Changed Files', '')
    skipped.forEach((file) => lines.push(`- \`${file}\``))
  }

  if (comparisons.length) {
    lines.push('', '## Base Comparison', '')
    lines.push('| Adapter | Run | Base | Head | Delta | Delta % | Status |')
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | --- |')
    comparisons.forEach((comparison) => {
      lines.push(`| ${[
        comparison.adapter,
        comparison.date,
        comparison.baseTotalTvl || comparison.baseStatus,
        comparison.headTotalTvl || comparison.headStatus,
        formatNumber(comparison.delta),
        formatPercent(comparison.deltaPct),
        comparison.status,
      ].join(' | ')} |`)
    })
  }

  const passedWithBreakdowns = results.filter((result) => result.status === 'passed' && Object.keys(result.tvlSummary?.byKey || {}).length)
  if (passedWithBreakdowns.length) {
    lines.push('', '## TVL Breakdowns', '')
    passedWithBreakdowns.forEach((result) => {
      lines.push('<details>')
      lines.push(`<summary>${result.adapter} (${result.date})</summary>`)
      lines.push('')
      lines.push('| Key | TVL |')
      lines.push('| --- | ---: |')
      Object.entries(result.tvlSummary.byKey).forEach(([key, tvl]) => {
        lines.push(`| ${key} | ${tvl.display} |`)
      })
      if (result.totalTvl)
        lines.push(`| total | ${result.totalTvl} |`)
      lines.push('</details>', '')
    })
  }

  if (failed.length) {
    lines.push('', '## Failures', '')
    failed.forEach((result) => {
      lines.push('<details>')
      lines.push(`<summary>${result.adapter} (${result.date})</summary>`)
      lines.push('')
      lines.push(`Command: \`${result.command}\``)
      lines.push('')
      if (result.error)
        lines.push(`Error: ${result.error}`, '')
      const stderr = tailLines(result.stderr)
      const stdout = tailLines(result.stdout)
      if (stderr) {
        lines.push('stderr:')
        lines.push(...fencedBlock(stderr))
      }
      if (stdout) {
        lines.push('stdout:')
        lines.push(...fencedBlock(stdout))
      }
      lines.push('</details>', '')
    })
  }

  return limitMarkdownReport(`${lines.join('\n')}\n`)
}

function limitMarkdownReport(markdown) {
  if (markdown.length <= MAX_MARKDOWN_REPORT_LENGTH)
    return markdown

  const notice = [
    '',
    '',
    '---',
    `Report truncated to stay under GitHub's PR comment size limit. The JSON artifact contains the full audit output.`,
    '',
  ].join('\n')
  const maxBodyLength = MAX_MARKDOWN_REPORT_LENGTH - notice.length
  const prefix = markdown.slice(0, maxBodyLength)
  const sectionBoundary = prefix.lastIndexOf('\n## ')
  const paragraphBoundary = prefix.lastIndexOf('\n\n')
  const cutoff = sectionBoundary > 0 ? sectionBoundary : paragraphBoundary > 0 ? paragraphBoundary : maxBodyLength

  return `${prefix.slice(0, cutoff).trimEnd()}${notice}`
}

function writeAuditOutputs(auditResult, options, reportOptions = {}) {
  const markdown = buildMarkdownReport(auditResult, reportOptions)

  if (options.markdownPath)
    fs.writeFileSync(path.resolve(auditResult.repoRoot, options.markdownPath), markdown)

  if (options.jsonPath)
    fs.writeFileSync(path.resolve(auditResult.repoRoot, options.jsonPath), `${JSON.stringify(auditResult, null, 2)}\n`)

  return markdown
}

function hasFailures(auditResult) {
  return auditResult.results.some((result) => result.status !== 'passed')
}

module.exports = {
  auditAdapters,
  buildMarkdownReport,
  compareAuditResults,
  discoverAdapterEntrypoints,
  getChangedFiles,
  getRepoRoot,
  hasFailures,
  parseAdapterArgs,
  writeAuditOutputs,
}
