const { execFileSync } = require('node:child_process')
const { Linter } = require('eslint')

const message = 'Use the getLogs2 helper instead of api.getLogs(...).'
const selectors = [
  'CallExpression > MemberExpression.callee[object.type="Identifier"][object.name="api"][computed=false][property.name="getLogs"]',
  'CallExpression > MemberExpression.callee[object.type="Identifier"][object.name="api"][computed=true][property.value="getLogs"]',
  'CallExpression > MemberExpression.callee[object.type="Identifier"][object.name="api"][computed=true][property.type="TemplateLiteral"][property.expressions.length=0][property.quasis.0.value.cooked="getLogs"]',
]

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
}

function addedRanges(diff) {
  return [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)]
    .map(([, start, count = '1']) => ({ start: +start, end: +start + +count - 1 }))
    .filter(({ start, end }) => end >= start)
}

function overlapsAddedLine(token, ranges) {
  return ranges.some(({ start, end }) => token.loc.start.line <= end && token.loc.end.line >= start)
}

function checkSource(source, ranges) {
  const rule = {
    meta: { schema: [] },
    create(context) {
      return {
        [selectors.join(', ')](node) {
          // Inspect tokens rather than the full node span so inserted comments
          // inside an existing multiline call do not count as new usage.
          const tokens = context.sourceCode.getTokens(node)
          // A reference can become a call by adding only the opening parenthesis.
          tokens.push(context.sourceCode.getTokenAfter(node, { filter: token => token.value === '(' }))
          if (tokens.some(token => overlapsAddedLine(token, ranges)))
            context.report({ node, message })
        },
      }
    },
  }
  return new Linter().verify(source, {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
    plugins: { local: { rules: { 'no-new-getlogs': rule } } },
    rules: { 'local/no-new-getlogs': 'error' },
  }, { allowInlineConfig: false })
}

function checkRevisions(base, head) {
  const files = git('diff', '--name-only', '-z', '--diff-filter=AM', '--no-renames',
    base, head, '--', 'projects/**/*.js').split('\0').filter(Boolean)
  return files.flatMap(file => {
    const diff = git('diff', '--no-ext-diff', '--no-textconv', '--unified=0',
      '--inter-hunk-context=0', base, head, '--', file)
    const ranges = addedRanges(diff)
    if (!ranges.length) return []
    const source = git('show', `${head}:${file}`)
    return checkSource(source, ranges)
      .map(({ line, column, message }) => `${file}:${line}:${column}: ${message}`)
  })
}

try {
  const [base, head] = process.argv.slice(2)
  if (![base, head].every(ref => /^[a-f0-9]{40}$/i.test(ref)))
    throw new Error('Usage: node .github/workflows/checkNewGetLogs.js <base-sha> <head-sha>')
  const errors = checkRevisions(base, head)
  if (errors.length) throw new Error(errors.join('\n'))
} catch (error) {
  console.error(`------ ERROR ------ > ${error.message}`)
  process.exitCode = 1
}
