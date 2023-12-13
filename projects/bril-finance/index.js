const { getLogs } = require('../helper/cache/getLogs')

const config = {
  bsc: { factory: '0xfaa2e7c69F7F34195D3Ef6CF98B6B009A6A07F30', fromBlock: 29703589, }
}

module.exports = {
  doublecounted: true,
  methodology: 'Count tokens managed by Bril automated liquidity management stratagies',
  start: 30131926,
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event StrategyInstanceDeployed (uint256 indexed typeId, address indexed strategyInstance, address indexed owner, address vault, bytes initData)',
        onlyArgs: true,
        fromBlock,
      })
      const strategies = logs.map(log => log.strategyInstance);
      const areStrategiesEnabled = await api.multiCall({ abi: factory_abi.isStrategyEnabled, calls: strategies, target: factory });
      const enabledStrategies = strategies.filter((s, index) => areStrategiesEnabled[index]);

      const balances = await api.multiCall({ abi: abi.vaultAmounts, calls: enabledStrategies, });
      const summaries = await api.multiCall({ abi: abi.vaultSummary, calls: enabledStrategies, });

      for (let i = 0; i < balances.length; i++) {
        api.add(summaries[i].baseToken_, balances[i].baseTotal_);
        api.add(summaries[i].scarceToken_, balances[i].scarceTotal_);
      }
    }
  }
})

const abi = {
  "vaultAmounts": "function vaultAmounts() view returns (uint256 baseTotal_, uint256 scarceTotal_ )",
  "vaultSummary": "function vaultSummary() view returns (address vault_, address baseToken_, address scarceToken_, bool inverted_, int24 tickSpacing_)"
}
const factory_abi = {
  "isStrategyEnabled": "function isStrategyEnabled(address) view returns (bool enabled_ )",
}
