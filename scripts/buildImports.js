const fs = require("fs")
const { execSync } = require("child_process")
const { get } = require("../projects/helper/http")
const { allProtocols } = require("../registries/index.js")
// const { setCache, getCache } = require("../projects/helper/cache")

async function run() {
  // await getCache('defi-configs', 'tvlModules')
  const configs = await get('https://api.llama.fi/_fe/static/configs')


  const moduleMap = {}
  const protocols = configs.protocols.concat(configs.treasuries).concat(configs.entities)
  const addedModules = new Set()

  console.log('# of protocols/treasuries/entities:', protocols.length)
  function addModule({ moduleObject, modulePath, moduleKey, warnOnMissing = false }) {
    try {

      if (addedModules.has(moduleKey)) return;  // already imported

      if (!modulePath) modulePath = `${moduleKey}/index.js`
      if (!moduleObject) {
        if (warnOnMissing) {
          console.warn(`Warning: ${moduleKey} not found in projects folder or registry. skipping.`)
        }
        return;
      }

      let mockedModule = mockFunctions(moduleObject)

      if (mockedModule.hallmarks)
        mockedModule.hallmarks = convertHallmarkStrings(mockedModule.hallmarks)

      moduleMap[modulePath] = mockedModule
      addedModules.add(moduleKey)
    } catch (e) {
      console.error(`Error processing module ${moduleKey} at path ${modulePath}:`, e)
    }
  }

  for (const protocol of protocols) {
    let pModule = protocol.module.replace(/\.js$/, '').replace(/\/index$/, '').replace(/\/api$/, '')

    const modulePath = `../projects/${protocol.module}`
    let moduleObject = undefined
    try {
      moduleObject = require(modulePath)
    } catch (e) { }

    if (moduleObject && allProtocols[pModule])
      console.warn(`Warning: ${protocol.module} exists in both projects folder and registry. Using projects version.`)
    moduleObject = moduleObject ?? allProtocols[pModule]   // first preference is if the file is in projects folder

    addModule({ moduleObject, modulePath: protocol.module, moduleKey: pModule, warnOnMissing: true })
  }

  // Iterate through all files/folders in ../projects and add missing ones
  const projectsPath = __dirname + '/../projects'
  const projectFiles = fs.readdirSync(projectsPath)
  const ignoredFolders = new Set(['treasury', 'entities', 'helper', 'stacks'])  // these folders contain submodules that will be imported separately

  for (const file of projectFiles) {
    const filePath = `${projectsPath}/${file}`
    const stat = fs.statSync(filePath)
    let modulePath, importPath, pModule

    if (stat.isDirectory()) {
      if (ignoredFolders.has(file)) continue  // skip these folders as they contain submodules that will be imported separately
      importPath = `${projectsPath}/${file}/index.js`
      modulePath = `${file}/index.js`
      pModule = file
    } else if (stat.isFile() && file.endsWith('.js')) {
      importPath = `${projectsPath}/${file}`
      modulePath = file
      pModule = file.replace(/\.js$/, '')
    }

    if (addedModules.has(pModule)) continue

    let moduleObject = undefined
    try {
      moduleObject = require(importPath)
    } catch (e) {
      console.error(`Error importing module ${pModule} from path ${importPath}:`, e)
    }

    addModule({ moduleObject, modulePath, moduleKey: pModule, warnOnMissing: false })
  }


  // iterate through all modules in registry and add missing ones
  for (const [pModule, moduleObject] of Object.entries(allProtocols)) {
    if (addedModules.has(pModule)) continue

    addModule({ moduleObject, modulePath: `${pModule}/index.js`, moduleKey: pModule, warnOnMissing: false })
  }


  // stamp each module with the commit that added its file (meta.addedCommit),
  // so consumers (born-to-llama bot) do not need a local clone for commit links
  try {
    const { fileMap, dirMap, createdMap } = getGitAddedInfo()
    for (const [modulePath, moduleObject] of Object.entries(moduleMap)) {
      if (!moduleObject || typeof moduleObject !== 'object') continue
      const path = `projects/${modulePath}`
      // modulePath is a file (aave/index.js, cover.js), a file without its
      // extension (treasury/jpegd -> treasury/jpegd.js) or a bare directory (hop)
      const commit = fileMap[path]
        ?? fileMap[`${path}.js`]
        ?? dirMap[path]
        ?? dirMap[path.replace(/\/index\.js$/, '')]
        ?? createdMap[path]
        ?? createdMap[`${path}.js`]
      if (commit) {
        if (!moduleObject.meta) moduleObject.meta = {}
        moduleObject.meta.addedCommit = commit
      }
    }
  } catch (e) {
    console.error('Error stamping git added commit:', e)
  }

  const commitHash = execSync('git rev-parse HEAD').toString().trim()
  moduleMap._meta = { commit: commitHash }

  fs.writeFileSync('scripts/tvlModules.json', JSON.stringify(moduleMap))

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})


function convertHallmarkStrings(hallmarks) {
  if (!Array.isArray(hallmarks)) return hallmarks
  return hallmarks.map((item) => {
    if (typeof item?.[0] === 'string') {
      item[0] = dateStringToTimestamp(item[0])
    }
    if (Array.isArray(item?.[0])) {
      item[0].forEach((subItem, index) => {
        if (typeof subItem === 'string') {
          item[0][index] = dateStringToTimestamp(subItem)
        }
      })
    }
    return item
  }).filter((item) => {
    if (typeof item?.[0] === 'number') return true
    // if it is a range hallmark
    if (Array.isArray(item?.[0] && typeof item[0][0] === 'number' && typeof item[0][1] === 'number')) {
      return true
    }
    return false
  })
}

// walk git history and map every path under projects/ to the commit that added it
// fileMap: file path -> latest commit that added it (handles delete + re-add)
// dirMap: directory path -> commit that added the first file under it (adapter creation)
// createdMap: file path -> oldest commit that touched it, i.e. the commit that
//   created it (fallback for files that never show as added)
function getGitAddedInfo() {
  const { execSync } = require("child_process")

  function walk(gitArgs, keepOldest) {
    // --first-parent: walk only the mainline, so a file shows as added at the
    // commit or PR merge that landed it on main, never at a side-branch commit
    // --no-renames: files moved into place still show as added instead of renamed
    const output = execSync(`git log --first-parent --no-renames --format="%H|" --name-only ${gitArgs} -- projects/`, { maxBuffer: 1024 * 1024 * 512 }).toString()
    const fileMap = {}
    const dirMap = {}
    let commit = null
    for (const line of output.split('\n')) {
      if (!line) continue
      if (line.length === 41 && line[40] === '|' && /^[0-9a-f]{40}$/.test(line.slice(0, 40))) {
        commit = line.slice(0, 40)
      } else if (commit) {
        // log is newest-first: first occurrence = latest commit for this path,
        // overwriting every occurrence keeps the oldest one instead
        if (keepOldest || !fileMap[line]) fileMap[line] = commit
        // keep overwriting ancestor dirs: the last write is the oldest file addition
        const parts = line.split('/')
        parts.pop()
        let dir = ''
        for (const part of parts) {
          dir = dir ? `${dir}/${part}` : part
          dirMap[dir] = commit
        }
      }
    }
    return { fileMap, dirMap }
  }

  const added = walk('--diff-filter=A', false)
  const touched = walk('', true)
  return { fileMap: added.fileMap, dirMap: added.dirMap, createdMap: touched.fileMap }
}

//Replace all fuctions with mock functions in an object all the way down
function mockFunctions(obj) {
  if (typeof obj === "function") {
    return '_f'  // llamaMockedTVLFunction
  } else if (typeof obj === "object") {
    Object.keys(obj).forEach((key) => obj[key] = mockFunctions(obj[key]))
  }
  return obj
}

function dateStringToTimestamp(dateString) {

  let timestamp = Math.floor(+new Date(dateString) / 1e3)
  if (!isNaN(timestamp))
    return timestamp
  return dateString
}