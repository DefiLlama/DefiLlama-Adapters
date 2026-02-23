const deadAdapters = require('./deadAdapters.json');

const adapterRoutes = [
  './deadAdapters.json',
  './uniswapV3',
  './uniswapV2',
  './aaveV3',
  './aave',
  './compound',
  './erc4626',
  './masterchef',
  './solanaStakePool',
  './stakingOnly',
  './uniswapV3Graph',
  './balancer',
  './gmx',
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