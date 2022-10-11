const MODIFIED = parse(process.env.MODIFIED)
const ADDED = parse(process.env.ADDED)
const fileSet = new Set();

[...MODIFIED, ...ADDED].forEach(file => {
  const [root, dir, adapter] = file.split('/')
  if (root === 'volumes' && dir === 'adapters') fileSet.add(adapter)
})

console.log(JSON.stringify([...fileSet]))

function parse(data) {
  return data.replace('[', '').replace(']', '').split(',')
}