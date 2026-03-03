const deadAdapters = require('./deadAdapters.json');

const adapterRoutes = [
  './deadAdapters.json',
  './uniswapV3.js',
  './uniswapV2.js',
  './aaveV3.js',
  './aave.js',
  './compound.js',
  './erc4626.js',
  './masterchef.js',
  './solanaStakePool.js',
  './stakingOnly.js',
  './uniswapV3Graph.js',
  './balancer.js',
  './gmx.js',
]
const allProtocols = {}

for (const route of adapterRoutes) {
  try {
    const adapters = require(route)
    const routeFile = route.replace('./', 'registries/')
    Object.entries(adapters).forEach(([key, data]) => {
      if (allProtocols[key]) {
        console.warn(`Duplicate protocol key "${key}" found in ${routeFile}. This will overwrite the previous entry from ${allProtocols[key].meta.moduleFilePath || 'unknown source'}.`)
      }
      
      if (!data.meta) data.meta = {}
      if (!data.meta.moduleFilePath)
        data.meta.moduleFilePath = routeFile
    })
    Object.assign(allProtocols, adapters)
  } catch (error) {
    console.error(`Error loading adapter from ${route}:`, error)
  }
}

Object.entries(deadAdapters).forEach(([key, value]) => {
  if (!value.meta) value.meta = {}
  value.meta.moduleFilePath = 'registries/deadAdapters.json'
})

module.exports = {
  allProtocols,
  deadAdapters,
  adapterRoutes,
};