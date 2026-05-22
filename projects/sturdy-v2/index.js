const abi = {
    "getStrategies": "function getStrategies() view returns (tuple(address deployedAt, address pair, tuple(address asset, string assetSymbol, uint256 assetDecimals, address collateral, string collateralSymbol, uint256 collateralDecimals, address rateContract, address oracle, uint256 depositLimit, uint64 ratePerSec, uint64 fullUtilizationRate, uint32 feeToProtocolRate, uint32 maxOacleDeviation, uint256 lowExchangeRate, uint256 highExchangeRate, uint256 maxLTV, uint256 protocolLiquidationFee, uint256 totalAsset, uint256 totalCollateral, uint256 totalBorrow, uint256 version) pairData)[])",
    "getVaults": "function getVaults() view returns (tuple(address deployedAt, bool isShutdown, address asset, string assetSymbol, uint256 assetDecimals, string name, uint256 totalAssets, uint256 totalDebt)[])"
  };

// DataProvider Addresses
const config = {
  ethereum: '0x69764E3e0671747A7768A1C1AfB7C0C39868CC9e',
  mode: '0xF0382A9Eca5276d7B4BbcC503e4159C046c120ec',
  linea: "0xd67Da8636Ae87b0cECBDa2e66dB58d4839722B52",
  optimism: "0x9dc7B2130e478C5810Dc0cDbD46B9D479b2e1aC4",
  sei: "0x4534F53A81416a83F6bAF5ac63c94aEd1fea1303",
  flow: "0x49b50F508091b57dAe0D072F21F5cC78d6d94903"
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
