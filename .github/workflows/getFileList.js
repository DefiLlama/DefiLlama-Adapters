const { execSync } = require('child_process')
const fs = require('fs')

const MODIFIED = parse(process.env.MODIFIED)
const ADDED = parse(process.env.ADDED)
const fileSet = new Set();

[...MODIFIED, ...ADDED].forEach(file => {
 const [root, dir] = file.split('/')
 if (dir === 'treasury' || dir === 'entities') fileSet.add(file)
 else if (root === 'projects' && dir !=='helper' && dir !== 'config') fileSet.add(root + '/' + dir)
 else if (root === 'registries' && /^registries\/([a-zA-Z0-9_-]+\/)?[a-zA-Z0-9_-]+\.js$/.test(file) && dir !== 'index.js' && dir !== 'utils.js') {
    let protocolNames = new Set()
    try { protocolNames = new Set(Object.keys(require('../../' + file))) } catch (e) {}
    const diffBase = process.env.DIFF_BASE || 'HEAD~1'
    const keyLine = /^  ['"]?([a-zA-Z0-9][a-zA-Z0-9_/-]+)['"]?\s*:/
    // map each line of the new file to the protocol entry it sits in, then pick the entries the diff touches
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    const keyAt = []
    let key
    lines.forEach((line, i) => {
      const match = line.match(keyLine)
      if (match && protocolNames.has(match[1])) key = match[1]
      keyAt[i + 1] = key
    })
    const diff = execSync(`git diff -U0 ${diffBase} -- ${file}`).toString()
    for (const hunk of diff.split(/^(?=@@ )/m).slice(1)) {
      const [, start, count = '1'] = hunk.match(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/)
      if (+count === 0) {
        // pure deletion: skip a removed entry, otherwise it belongs to the entry around the line before it
        const removedEntry = hunk.split('\n').some(l => l.startsWith('-') && keyLine.test(l.slice(1)))
        if (!removedEntry && keyAt[+start]) fileSet.add(keyAt[+start])
        continue
      }
      for (let l = +start; l < +start + +count; l++)
        if (keyAt[l]) fileSet.add(keyAt[l])
    }
 }
})

console.log(JSON.stringify([...fileSet]))

function parse(data) {
 return data.replace('[', '').replace(']', '').split(',')
}
