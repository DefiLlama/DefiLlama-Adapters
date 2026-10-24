const assert = require('node:assert/strict')
const path = require('node:path')
const { test } = require('node:test')
const { ESLint } = require('eslint')

const eslint = new ESLint({ overrideConfigFile: path.resolve(__dirname, '../../eslint.config.js') })

const cases = [
  ['the reported comment', '// يمكنك استخدام api.getLogs() لتتبع أحداث معينة\n', false],
  ['a string literal', 'const example = "api.getLogs()"\n', false],
  ['a different object', 'other.getLogs()\n', false],
  ['a direct call', 'api.getLogs()\n', true],
  ['a multiline call', 'api.getLogs(\n  options\n)\n', true],
  ['an optional call', 'api?.getLogs?.()\n', true],
  ['a computed call', 'api["getLogs"]()\n', true],
]

for (const [name, source, restricted] of cases) {
  test(`getLogs restriction ${restricted ? 'rejects' : 'allows'} ${name}`, async () => {
    const [result] = await eslint.lintText(source, { filePath: 'projects/get-logs-rule-fixture.js' })
    const violations = result.messages.filter(message => message.ruleId === 'no-restricted-syntax')
    assert.equal(violations.length, restricted ? 1 : 0)
  })
}
