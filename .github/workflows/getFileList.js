const { execFileSync } = require('child_process')

function getRunFiles({ modified, added, diffBase = 'HEAD~1', readDiff = readGitDiff }) {
  const fileSet = new Set()
  const changedFiles = [...parseFileList(modified), ...parseFileList(added)]

  changedFiles.forEach(file => {
    const [root, dir] = file.split('/')
    if (dir === 'treasury' || dir === 'entities') fileSet.add(file)
    else if (root === 'projects' && dir !== 'helper' && dir !== 'config') fileSet.add(root + '/' + dir)
    else if (root === 'registries' && file.endsWith('.js') && dir !== 'index.js' && dir !== 'utils.js') {
      const diff = readDiff(diffBase, file)
      const lines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'))
      for (const line of lines) {
        const match = line.match(/['"]([a-zA-Z0-9][a-zA-Z0-9_-]+)['"]\s*:/)
        if (match) fileSet.add(match[1])
      }
    }
  })

  return [...fileSet]
}

function readGitDiff(diffBase, file) {
  return execFileSync('git', ['diff', diffBase, '--', file], { encoding: 'utf8' })
}

function parseFileList(data) {
  if (!data) return []

  const input = String(data).trim()
  if (!input) return []

  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) return parsed.map(normalizeFile).filter(Boolean)
    if (typeof parsed === 'string') return parseFileList(parsed)
  } catch {
    // Fall back to the legacy comma-delimited format.
  }

  return input
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map(normalizeFile)
    .filter(Boolean)
}

function normalizeFile(file) {
  return String(file).trim().replace(/^['"]+|['"]+$/g, '').trim()
}

if (require.main === module) {
  console.log(JSON.stringify(getRunFiles({
    modified: process.env.MODIFIED,
    added: process.env.ADDED,
    diffBase: process.env.DIFF_BASE || 'HEAD~1',
  })))
}

module.exports = { getRunFiles, parseFileList }
