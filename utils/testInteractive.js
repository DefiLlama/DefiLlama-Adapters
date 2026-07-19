const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const inquirer = require('inquirer')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const REPO_ROOT = path.resolve(__dirname, '..')
const PROJECTS_DIR = path.join(REPO_ROOT, 'projects')
const TVL_MODULES_PATH = path.join(REPO_ROOT, 'scripts/tvlModules.json')
const IGNORED_FOLDERS = new Set(['treasury', 'entities', 'helper', 'stacks'])

const args = process.argv.slice(2)
const subdir = args[0] // e.g. 'treasury', 'entities'; undefined => projects/

async function main() {
  if (subdir) {
    await runFuzzyMode(subdir)
    return
  }

  await runBuild()
  const state = buildChoices()
  startGitRefresh(state)
  await runListMode(state)
}

function startGitRefresh(state, intervalMs = 5000) {
  const tick = () => {
    try {
      const changed = listGitChangedAdapters(state.buildCommit)
      let added = 0
      for (const adapter of changed) {
        const value = stripIndex(adapter)
        if (state.seen.has(value)) continue
        state.seen.add(value)
        state.choices.unshift({ value, tag: 'changed', name: `[changed] ${value}` })
        added++
      }
      if (added) console.log(`\n(${added} new adapter${added > 1 ? 's' : ''} detected — type to refresh list)`)
    } catch { /* ignore */ }
  }
  const timer = setInterval(tick, intervalMs)
  timer.unref?.()
}

function runBuild() {
  console.log('Running `npm run build`...')
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn('npm', ['run', 'build'], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(`npm run build exited with code ${code}`))
      else resolve()
    })
  })
}

// Returns { choices, seen, buildCommit }. choices is mutated in place by the refresher.
function buildChoices() {
  const raw = fs.readFileSync(TVL_MODULES_PATH, 'utf8')
  const map = JSON.parse(raw)
  const buildCommit = map._meta && map._meta.commit
  const buildKeys = new Set(Object.keys(map).filter((k) => k !== '_meta'))

  const tags = new Map() // value (path without /index.js) -> tag string|null
  const setTag = (value, tag) => {
    if (!tags.has(value)) tags.set(value, tag)
  }

  for (const key of buildKeys) setTag(stripIndex(key), null)

  for (const adapter of listAdaptersOnDisk()) {
    if (!buildKeys.has(adapter) && !buildKeys.has(stripIndex(adapter))) {
      setTag(stripIndex(adapter), 'missing')
    }
  }

  for (const adapter of listGitChangedAdapters(buildCommit)) {
    tags.set(stripIndex(adapter), 'changed')
  }

  const choices = [...tags.entries()].map(([value, tag]) => ({
    value,
    tag,
    name: tag ? `[${tag}] ${value}` : value,
  }))

  choices.sort((a, b) => {
    if (!!a.tag !== !!b.tag) return a.tag ? -1 : 1
    return a.value.localeCompare(b.value)
  })

  return { choices, seen: new Set(tags.keys()), buildCommit }
}

function stripIndex(p) {
  return p.replace(/\/index\.js$/, '')
}

function listAdaptersOnDisk() {
  const out = []
  for (const file of fs.readdirSync(PROJECTS_DIR)) {
    const full = path.join(PROJECTS_DIR, file)
    let stat
    try { stat = fs.statSync(full) } catch { continue }
    if (stat.isDirectory()) {
      if (IGNORED_FOLDERS.has(file)) continue
      if (fs.existsSync(path.join(full, 'index.js'))) out.push(`${file}/index.js`)
    } else if (stat.isFile() && file.endsWith('.js')) {
      out.push(file)
    }
  }
  return out
}

function listGitChangedAdapters(buildCommit) {
  const paths = new Set()
  const collect = (cmd) => {
    try {
      const out = childProcess.execSync(cmd, { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString()
      out.split('\n').filter(Boolean).forEach((p) => paths.add(p))
    } catch { /* ignore */ }
  }

  if (buildCommit) collect(`git diff --name-only ${buildCommit} -- projects/`)
  collect(`git diff --name-only HEAD -- projects/`)
  collect(`git ls-files --others --exclude-standard projects/`)

  const adapters = new Set()
  for (const p of paths) {
    // p looks like projects/foo/bar.js or projects/foo/...
    const rel = p.replace(/^projects\//, '')
    const top = rel.split('/')[0]
    if (IGNORED_FOLDERS.has(top)) continue

    // Resolve to an adapter entry that exists on disk
    const asFile = path.join(PROJECTS_DIR, rel)
    if (rel.endsWith('.js') && fs.existsSync(asFile)) {
      // direct .js change — use the top-level adapter (file or folder/index.js)
      const topFull = path.join(PROJECTS_DIR, top)
      if (fs.existsSync(topFull) && fs.statSync(topFull).isDirectory()) {
        if (fs.existsSync(path.join(topFull, 'index.js'))) adapters.add(`${top}/index.js`)
      } else if (top.endsWith('.js') && fs.existsSync(topFull)) {
        adapters.add(top)
      }
    }
  }
  return [...adapters]
}

async function runListMode(state) {
  inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
  const fuzzy = require('fuzzy')

  let last
  while (true) {
    const { adapter } = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'adapter',
        message: 'Select an adapter to run:',
        default: last,
        pageSize: 20,
        source: async (_answers, input) => {
          const list = input
            ? fuzzy.filter(input, state.choices, { extract: (c) => c.name }).map((r) => r.original)
            : state.choices
          return list.map((c) => ({ name: c.name, value: c.value }))
        },
      },
    ])
    last = adapter
    await runAdapter(path.join('projects', adapter))
  }
}

async function runFuzzyMode(rel) {
  inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
  const targetDir = path.join(PROJECTS_DIR, rel)
  process.chdir(targetDir)
  console.log('Working directory: ' + process.cwd())

  const prompt = {
    type: 'fuzzypath',
    name: 'adapterPath',
    excludePath: (p) => p.startsWith('helper'),
    excludeFilter: (p) => p === '.',
    itemType: 'any',
    rootPath: '.',
    message: 'Select an adapter to run:',
    suggestOnly: false,
    depthLimit: 0,
  }

  let { adapterPath } = await inquirer.prompt([prompt])
  while (true) {
    prompt.default = adapterPath
    await runAdapter(adapterPath)
    const ans = await inquirer.prompt([prompt])
    adapterPath = ans.adapterPath
  }
}

function runAdapter(adapterPath) {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      LLAMA_SDK_MAX_PARALLEL: 100,
      LLAMA_DEBUG_MODE: true,
    }
    const startTime = Date.now()
    const child = childProcess.fork(path.join(REPO_ROOT, 'test.js'), [adapterPath], { env })
    child.on('error', reject)
    child.on('close', () => {
      console.log(`\n      Run time: ${(Date.now() - startTime) / 1000} (seconds)\n`)
      resolve()
    })
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
