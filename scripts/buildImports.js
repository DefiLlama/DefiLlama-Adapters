const fs = require("fs")
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

  for (const file of projectFiles) {
    const filePath = `${projectsPath}/${file}`
    const stat = fs.statSync(filePath)
    let modulePath, importPath, pModule

    if (stat.isDirectory()) {
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
    } catch (e) { }

    addModule({ moduleObject, modulePath, moduleKey: pModule, warnOnMissing: false })
  }


  // iterate through all modules in registry and add missing ones
  for (const [pModule, moduleObject] of Object.entries(allProtocols)) {
    if (addedModules.has(pModule)) continue

    addModule({ moduleObject, modulePath: `${pModule}/index.js`, moduleKey: pModule, warnOnMissing: false })
  }


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