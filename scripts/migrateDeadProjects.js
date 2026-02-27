const fs = require("fs")
const path = require("path")

const projectsDir = path.join(__dirname, '../projects')
const deadDir = path.join(projectsDir, 'dead')
const outputPath = path.join(__dirname, '../registries/deadAdapters.json')
const deadChains = require('../projects/helper/deadChains')
const whitelistedExportKeys = require('../projects/helper/whitelistedExportKeys.json')
let deadAdapters = require('../registries/deadAdapters.json')

function sortObjectByKey(obj) {
  return Object.keys(obj).sort().reduce((sorted, key) => {
    sorted[key] = obj[key]
    return sorted
  }, {})
}

deadAdapters = sortObjectByKey(deadAdapters)

const deadChainsSet = new Set(deadChains)
const ignoreKeysSet = new Set([...deadChains, ...whitelistedExportKeys])

function mockFunctions(obj) {
  if (typeof obj === "function") {
    return '_f'
  } else if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach((key) => obj[key] = mockFunctions(obj[key]))
  }
  return obj
}

function processEntry(deadAdapters, modulePath, moduleName, pathToMove) {
  try {
    const importedModule = require(modulePath)
    const exportKeys = Object.keys(importedModule)

    const isDead = exportKeys.every(key => ignoreKeysSet.has(key))
    const defaultDeadFrom = (new Date()).toISOString().split('T')[0]

    if (isDead && importedModule.deadFrom === undefined) {
      const deadChains = exportKeys.filter(key => deadChainsSet.has(key))
      if (deadChains.length > 0) {
        console.log(`${moduleName} Dead on chains: ${deadChains.join(', ')}`)
        importedModule.deadFrom = defaultDeadFrom
      }
    }


    if (importedModule.deadFrom !== undefined) {
      const mockedModule = mockFunctions({ ...importedModule })
      deadAdapters[moduleName] = mockedModule
      console.log(`Found dead project: ${moduleName} (deadFrom: ${importedModule.deadFrom})`)

      // Move to dead folder
      if (!fs.existsSync(deadDir)) {
        fs.mkdirSync(deadDir, { recursive: true })
      }
      const destPath = path.join(deadDir, path.basename(pathToMove))
      fs.renameSync(pathToMove, destPath)
      return true
    }
  } catch (e) {
    // Skip modules that fail to import
  }
  return false
}

async function run() {

  // First, process treasury folder
  const treasuryDir = path.join(projectsDir, 'treasury')
  const deadTreasuryDir = path.join(deadDir, 'treasury')
  if (fs.existsSync(treasuryDir)) {
    const treasuryEntries = fs.readdirSync(treasuryDir)
    for (const entry of treasuryEntries) {
      if (!entry.endsWith('.js')) continue
      const entryPath = path.join(treasuryDir, entry)
      const moduleName = `treasury/${entry.replace('.js', '')}`
      processEntryTreasury(deadAdapters, entryPath, moduleName, entry)
    }
  }

  function processEntryTreasury(deadAdapters, modulePath, moduleName, fileName) {
    try {
      const importedModule = require(modulePath)
      if (importedModule.deadFrom !== undefined) {
        const mockedModule = mockFunctions({ ...importedModule })
        deadAdapters[moduleName] = mockedModule
        console.log(`Found dead project: ${moduleName} (deadFrom: ${importedModule.deadFrom})`)

        // Move to dead/treasury folder
        if (!fs.existsSync(deadTreasuryDir)) {
          fs.mkdirSync(deadTreasuryDir, { recursive: true })
        }
        const destPath = path.join(deadTreasuryDir, fileName)
        fs.renameSync(modulePath, destPath)
        return true
      }
    } catch (e) {
      // Skip modules that fail to import
    }
    return false
  }

  // Then process the rest of projects
  const entries = fs.readdirSync(projectsDir)

  for (const entry of entries) {
    if (entry === 'helper' || entry === 'treasury' || entry === 'dead') continue

    const entryPath = path.join(projectsDir, entry)
    const stat = fs.statSync(entryPath)

    let moduleName
    let modulePath

    if (stat.isDirectory()) {
      const indexPath = path.join(entryPath, 'index.js')
      if (!fs.existsSync(indexPath)) continue
      moduleName = entry
      modulePath = indexPath
    } else if (entry.endsWith('.js')) {
      moduleName = entry.replace('.js', '')
      modulePath = entryPath
    } else {
      continue
    }

    processEntry(deadAdapters, modulePath, moduleName, entryPath)
  }

  // Ensure the directory exists
  const outputDir = path.dirname(outputPath)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, JSON.stringify(deadAdapters, null, 2))
  console.log(`\nWrote ${Object.keys(deadAdapters).length} dead adapters to ${outputPath}`)

  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
