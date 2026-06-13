const { execSync } = require('child_process')

const MODIFIED = parse(process.env.MODIFIED)
const ADDED = parse(process.env.ADDED)
const fileSet = new Set();

[...MODIFIED, ...ADDED].forEach(file => {
  const [root, dir] = file.split('/')
  if (dir === 'treasury' || dir === 'entities') fileSet.add(file)
  else if (root === 'projects' && dir !=='helper' && dir !== 'config') fileSet.add(root + '/' + dir)
  else if (root === 'registries' && file.endsWith('.js') && dir !== 'index.js' && dir !== 'utils.js') {
    const diffBase = process.env.DIFF_BASE || 'HEAD~1'
    const diff = execSync(`git diff ${diffBase} -- ${file}`).toString()
    const lines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'))
    for (const line of lines) {
      const match = line.match(/['"]([a-zA-Z0-9][a-zA-Z0-9_-]+)['"]\s*:/)
      if (match) fileSet.add(match[1])
    }
  }
})

console.log(JSON.stringify([...fileSet]))

function parse(data) {
  return data.replace('[', '').replace(']', '').split(',')
}
