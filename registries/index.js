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
]
const allProtocols = {}

for (const route of adapterRoutes) {
  try {
    const adapter = require(route)
    Object.assign(allProtocols, adapter)
  } catch (error) {
    console.error(`Error loading adapter from ${route}:`, error)
  }
}

module.exports = {
  allProtocols,
  deadAdapters,
};