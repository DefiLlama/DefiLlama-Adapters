#!/usr/bin/env node

const {
  auditAdapters,
  discoverAdapterEntrypoints,
  getChangedFiles,
  getRepoRoot,
  hasFailures,
  parseAdapterArgs,
  writeAuditOutputs,
} = require('./adapterAudit')

const USAGE = `
Usage:
  node utils/auditChangedAdapters.js [options]

Examples:
  node utils/auditChangedAdapters.js --base origin/main
  node utils/auditChangedAdapters.js --base main --date 2024-10-16 --markdown adapter-audit.md
  node utils/auditChangedAdapters.js --base origin/main --compare-base

Options:
  --base <ref>           Git ref to diff against. Default: origin/main.
  --date <date>          Run changed adapters at a historical date or unix timestamp. Can be repeated.
  --compare-base         Also run the same adapters from --base and include a TVL delta table.
  --timeout <ms>         Per-run timeout. Default: 600000.
  --markdown <path>      Write the Markdown report to a file.
  --json <path>          Write the full JSON result to a file.
  -h, --help             Show this help.
`

async function main() {
  const options = parseAdapterArgs(process.argv.slice(2), { allowBase: true })

  if (options.help) {
    console.log(USAGE.trim())
    return
  }

  if (options.adapterPaths.length)
    throw new Error('auditChangedAdapters does not accept adapter paths; use utils/auditAdapter.js for explicit adapters.')

  const repoRoot = getRepoRoot()
  const changedFiles = getChangedFiles(options.baseRef, repoRoot)
  const { adapters, skipped } = discoverAdapterEntrypoints(changedFiles, repoRoot, { baseRef: options.baseRef })

  if (adapters.length === 0) {
    const auditResult = {
      generatedAt: new Date().toISOString(),
      repoRoot,
      baseRef: options.baseRef,
      changedFiles,
      adapters: [],
      skipped,
      results: [],
    }
    const markdown = writeAuditOutputs(auditResult, options, {
      title: 'Changed Adapter Audit',
      baseRef: options.baseRef,
      changedFiles,
      skipped,
    })
    process.stdout.write(markdown)
    return
  }

  const auditResult = await auditAdapters(adapters, { ...options, repoRoot })
  auditResult.baseRef = options.baseRef
  auditResult.changedFiles = changedFiles
  auditResult.skipped = skipped
  const markdown = writeAuditOutputs(auditResult, options, {
    title: 'Changed Adapter Audit',
    baseRef: options.baseRef,
    changedFiles,
    skipped,
  })
  process.stdout.write(markdown)

  if (hasFailures(auditResult))
    process.exit(1)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
