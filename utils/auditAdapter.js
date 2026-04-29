#!/usr/bin/env node

const {
  auditAdapters,
  getRepoRoot,
  hasFailures,
  parseAdapterArgs,
  writeAuditOutputs,
} = require('./adapterAudit')

const USAGE = `
Usage:
  node utils/auditAdapter.js <adapter...> [options]

Examples:
  node utils/auditAdapter.js projects/aave/index.js
  node utils/auditAdapter.js projects/aave/v1.js --date 2024-10-16
  node utils/auditAdapter.js projects/aave/index.js --date 2024-10-16 --date 1729080692 --markdown adapter-audit.md --json adapter-audit.json
  node utils/auditAdapter.js projects/aave/index.js --compare-base --base origin/main

Options:
  --base <ref>           Git ref to compare against when --compare-base is set. Default: origin/main.
  --date <date>          Run the adapter at a historical date or unix timestamp. Can be repeated.
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

  if (options.adapterPaths.length === 0)
    throw new Error('Missing adapter path. Run with --help for usage.')

  const repoRoot = getRepoRoot()
  const auditResult = await auditAdapters(options.adapterPaths, { ...options, repoRoot })
  const markdown = writeAuditOutputs(auditResult, options)
  process.stdout.write(markdown)

  if (hasFailures(auditResult))
    process.exit(1)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
