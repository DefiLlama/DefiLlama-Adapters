const abi = require("./abi.json");

// DataProvider Addresses
const config = {
  ethereum: '0x69764E3e0671747A7768A1C1AfB7C0C39868CC9e',
  mode: '0xF0382A9Eca5276d7B4BbcC503e4159C046c120ec',
}

module.exports = {
  methodology: 'Gets the aggregators & strategies from the DataProvider contract and adds the asset amounts from each of them',
}

Object.keys(config).forEach(chain => {
  const dataProvider = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const aggregators = await api.call({target: dataProvider, abi: abi['getVaults'], })
      aggregators.forEach((aggregator) => api.add(aggregator.asset, (aggregator.totalAssets - aggregator.totalDebt)))
    
      const strategies = await api.call({ target: dataProvider, abi: abi['getStrategies'], })
      strategies.forEach((strategy) => api.add(strategy.pairData.asset, strategy.pairData.totalAsset))
      strategies.forEach((strategy) => api.add(strategy.pairData.collateral, strategy.pairData.totalCollateral))
    },
    borrowed: async (api) => {
      const strategies = await api.call({ target: dataProvider, abi: abi['getStrategies'], })
      const pairs = strategies.map((strategy) => strategy.pair);
      const assets = strategies.map((strategy) => strategy.pairData.asset);
      const bals = await api.multiCall({ abi: 'function totalBorrow() view returns (uint128 amount, uint128 shares)', calls: pairs })
      bals.forEach((bal, i) => api.add(assets[i], bal.amount))
    }
  }
})
