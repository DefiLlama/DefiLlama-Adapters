const deadModules = require('./modules/dead/index.js')
const { moduleToImportKey } = require('./modules/util.js')

const adapters = {
  ...deadModules,
}

function getModule(moduleName) {
  const importKey = moduleToImportKey(moduleName)
  return adapters[importKey] 
}

module.exports = {
  moduleToImportKey,
  getModule,
  adapters,
}