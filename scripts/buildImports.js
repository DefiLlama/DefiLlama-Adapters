const fs = require("fs")
const { get } = require("../projects/helper/http")
// const { setCache, getCache } = require("../projects/helper/cache")

async function run() {
  // await getCache('defi-configs', 'tvlModules')
  const configs = await get('https://api.llama.fi/_fe/static/configs')

  const moduleMap = {}
  const protocols = configs.protocols.concat(configs.treasuries).concat(configs.entities)

  console.log('# of protocols/treasuries/entities:', protocols.length)

  for (const protocol of protocols) {
    try {

      if (moduleMap[protocol.module]) continue;  // already imported

      const modulePath = `../projects/${protocol.module}`
      const importedModule = mockFunctions(require(modulePath))

      if (importedModule.hallmarks)
        importedModule.hallmarks = convertHallmarkStrings(importedModule.hallmarks)

      moduleMap[protocol.module] = importedModule
    } catch (e) {
      console.error(`Error importing ${protocol.module}:`, e)
    }
  }

  fs.writeFileSync('scripts/tvlModules.json', JSON.stringify(moduleMap))
  // await setCache('defi-configs', 'tvlModules', moduleMap, {
  //   skipCompression: true,
  // })

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