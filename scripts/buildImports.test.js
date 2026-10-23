const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { test } = require('node:test')

const repo = path.resolve(__dirname, '..')
const commit = 'a'.repeat(40)
const valid = "module.exports = { marker: 'valid', ethereum: { tvl: async () => ({}) }, hallmarks: [['2024-01-01', 'launch']] }"
const failures = {
  syntax: 'module.exports = {',
  runtime: "throw new Error('fixture runtime failure')",
  dependency: "require('./missing-dependency')",
}
const failureDiagnostics = {
  syntax: /SyntaxError/,
  runtime: /fixture runtime failure/,
  dependency: /Cannot find module '\.\/missing-dependency'/,
}

// Copy the production entrypoints unchanged, replacing only their inputs.
// Real Node resolution/imports, registry processing, and artifact writes run in
// child processes. No installed packages, network, RPC, or git history needed.
function fixture(t, { configs = {}, files = {}, gitLogFails = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'build-imports-test-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  function write(name, content) {
    const target = path.join(root, name)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }
  const registrySource = fs.readFileSync(path.join(repo, 'registries/index.js'), 'utf8')
  write('registries/index.js', registrySource)
  write('scripts/buildImports.js', fs.readFileSync(path.join(repo, 'scripts/buildImports.js')))
  const routes = registrySource.match(/const adapterRoutes = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)
  for (const [, route] of routes) {
    write(path.join('registries', route), route.endsWith('.json') ? '{}' : 'module.exports = {}')
  }
  write('projects/control/index.js', valid)
  write('projects/helper/http.js', `exports.get = async () => (${JSON.stringify({ protocols: [{ module: 'control/index.js' }], treasuries: [], entities: [], ...configs })})`)
  write('preload.cjs', `
    require('node:child_process').execSync = (command) => {
      if (command === 'git rev-parse HEAD') return Buffer.from('${commit}\\n')
      if (command.startsWith('git log ')) {
        if (${gitLogFails}) throw new Error('fixture optional git log failure')
        return Buffer.from('${commit}|\\nprojects/control/index.js\\n')
      }
      throw new Error('Unexpected command: ' + command)
    }
  `)
  for (const [name, content] of Object.entries(files)) {
    if (content === null) fs.rmSync(path.join(root, name))
    else write(name, content)
  }
  const output = path.join(root, 'scripts/tvlModules.json')
  function run(args = ['scripts/buildImports.js']) {
    const result = spawnSync(process.execPath, ['--require', './preload.cjs', ...args], {
      cwd: root, encoding: 'utf8', timeout: 10000,
    })
    assert.ifError(result.error)
    assert.equal(result.signal, null, result.stderr)
    return result
  }
  return { root, output, write, run }
}

test('valid build preserves configured, discovered, registry-only, dead and missing-module behavior', (t) => {
  const f = fixture(t, {
    configs: {
      protocols: [{ module: 'control/index.js' }, { module: 'fallback/index.js' }, { module: 'retired/index.js' }, { module: 'absent/index.js' }],
      treasuries: [{ module: 'treasury/example.js' }],
      entities: [{ module: 'entities/example.js' }],
    },
    files: {
      'projects/discovered.js': valid,
      'projects/treasury/example.js': valid,
      'projects/entities/example.js': valid,
      // Existing folders without an index are not standalone adapters.
      'projects/no-index/data.json': '{}',
      'projects/README.md': 'Not an adapter',
      'registries/uniswapV3.js': `module.exports = { fallback: { tvl: () => ({}) }, registryOnly: { tvl: () => ({}) }, control: { marker: 'registry' } }`,
      'registries/deadAdapters.json': JSON.stringify({ retired: { ethereum: { tvl: 0 } } }),
    },
  })
  const result = f.run()
  assert.equal(result.status, 0, result.stderr)
  const manifest = JSON.parse(fs.readFileSync(f.output, 'utf8'))
  assert.deepEqual(Object.keys(manifest).sort(), ['control/index.js', 'fallback/index.js', 'retired/index.js', 'treasury/example.js', 'entities/example.js', 'discovered.js', 'registryOnly/index.js', '_meta'].sort())
  assert.equal(manifest['control/index.js'].marker, 'valid')
  assert.equal(manifest['control/index.js'].ethereum.tvl, '_f')
  assert.equal(manifest['control/index.js'].hallmarks[0][0], 1704067200)
  assert.equal(manifest['control/index.js'].meta.addedCommit, commit)
  assert.equal(manifest['fallback/index.js'].tvl, '_f')
  assert.equal(manifest['retired/index.js'].ethereum.tvl, 0)
  assert.deepEqual(manifest._meta, { commit })
  assert.match(result.stderr, /absent.*not found/)
})

test('optional git history failure still publishes an otherwise complete manifest', (t) => {
  const f = fixture(t, { gitLogFails: true })
  const result = f.run()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stderr, /fixture optional git log failure/)
  assert.equal(JSON.parse(fs.readFileSync(f.output, 'utf8'))['control/index.js'].marker, 'valid')
})

const scenarios = []
for (const [kind, source] of Object.entries(failures)) {
  for (const fallback of [false, true]) {
    scenarios.push({
      name: `configured ${kind} error${fallback ? ' with registry fallback' : ''}`,
      configs: { protocols: [{ module: 'control/index.js' }, { module: 'broken/index.js' }] },
      files: {
        'projects/broken/index.js': source,
        ...(fallback ? { 'registries/uniswapV3.js': 'module.exports = { broken: { tvl: () => ({}) } }' } : {}),
      },
      diagnostic: /broken[\\/]index\.js/,
      causeDiagnostic: failureDiagnostics[kind],
    })
  }
  scenarios.push({ name: `discovered ${kind} error`, files: { 'projects/broken.js': source }, diagnostic: /broken\.js/, causeDiagnostic: failureDiagnostics[kind] })
  scenarios.push({ name: `registry ${kind} error`, files: { 'registries/uniswapV3.js': source }, diagnostic: /uniswapV3\.js/, causeDiagnostic: failureDiagnostics[kind] })
}
scenarios.push(
  { name: 'missing registry route', files: { 'registries/uniswapV3.js': null }, diagnostic: /uniswapV3\.js/ },
  { name: 'registry route processing error', files: { 'registries/uniswapV3.js': 'module.exports = { broken: null }' }, diagnostic: /uniswapV3\.js/ },
  { name: 'configured processing error', configs: { protocols: [{ module: 'control/index.js' }, { module: 'broken/index.js' }] }, files: { 'projects/broken/index.js': 'module.exports = { ethereum: null }' }, diagnostic: /broken/ },
  { name: 'discovered processing error', files: { 'projects/broken.js': 'module.exports = { ethereum: null }' }, diagnostic: /broken/ },
  { name: 'registry adapter processing error', files: { 'registries/uniswapV3.js': 'module.exports = { broken: { ethereum: null } }' }, diagnostic: /broken/ },
)

for (const scenario of scenarios) {
  for (const existingArtifact of [false, true]) {
    test(`${scenario.name} fails without ${existingArtifact ? 'overwriting' : 'creating'} a manifest`, (t) => {
      const f = fixture(t, scenario)
      const previous = '{"previous":"valid manifest"}\n'
      if (existingArtifact) f.write('scripts/tvlModules.json', previous)
      const result = f.run()
      assert.equal(result.status, 1, result.stdout + result.stderr)
      assert.match(result.stderr, scenario.diagnostic)
      if (scenario.causeDiagnostic) assert.match(result.stderr, scenario.causeDiagnostic)
      if (existingArtifact) assert.equal(fs.readFileSync(f.output, 'utf8'), previous)
      else assert.equal(fs.existsSync(f.output), false)
    })
  }
}

test('ordinary registry consumers retain partial results and receive route errors separately', (t) => {
  const f = fixture(t, {
    files: {
      'registries/uniswapV3.js': failures.runtime,
      'registries/uniswapV2.js': 'module.exports = { neighbor: { tvl: () => ({}) } }',
    },
  })
  const result = f.run(['-e', `
    const assert = require('node:assert/strict')
    const { allProtocols, registryErrors } = require('./registries')
    assert.equal(typeof allProtocols.neighbor.tvl, 'function')
    assert.equal(registryErrors.length, 1)
    assert.match(registryErrors[0].message, /uniswapV3/)
    assert.equal(registryErrors[0].cause.message, 'fixture runtime failure')
  `])
  assert.equal(result.status, 0, result.stderr)
})
