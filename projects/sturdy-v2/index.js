const abi = require("./abi.json");

const REGISTRY_ADDR = "0x69764E3e0671747A7768A1C1AfB7C0C39868CC9e"

async function tvl(timestamp, block, chainBlocks, { api }) {
  const aggregators = await api.call({target: REGISTRY_ADDR, abi: abi['getVaults'], })
  aggregators.forEach((aggregator) => api.add(aggregator.asset, aggregator.totalAssets))

  const strategies = await api.call({ target: REGISTRY_ADDR, abi: abi['getStrategies'], })
  strategies.forEach((strategy) => api.add(strategy.pairData.collateral, strategy.pairData.totalCollateral))
}
async function borrowed(timestamp, block, chainBlocks, { api }) {
  const strategies = await api.call({ target: REGISTRY_ADDR, abi: abi['getStrategies'], })
  const pairs = strategies.map((strategy) => strategy.pair);
  const assets = strategies.map((strategy) => strategy.pairData.asset);
  const bals = await api.multiCall({ abi: 'function totalBorrow() view returns (uint128 amount, uint128 shares)', calls: pairs })
  bals.forEach((bal, i) => api.add(assets[i], bal.amount))
}

module.exports = {
  methodology: 'Gets the aggregators & strategies from the REGISTRY_ADDRESS and adds the asset amounts from each of them',
  ethereum: {
    tvl, borrowed,
  },
}