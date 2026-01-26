const APERTURE_MANAGER_ADDRESS = "0xeD380115259FcC9088c187Be1279678e23a6E565";

const abis = {
  strategyIdToMetadata: "function strategyIdToMetadata(uint64 arg0) view returns (string, string, address strategy)",
  "getStrategyId": "uint64:nextStrategyId",
  "getLeverage": "uint256:leverageLevel",
  "getEquityETHValue": "uint256:getEquityETHValue",
  "getETHPx": "function getETHPx(address oracle, address token) view returns (uint256)"
}

async function avax_tvl(api) {
  const strategies = await api.fetchList({ lengthAbi: 'nextStrategyId', itemAbi: abis.strategyIdToMetadata, target: APERTURE_MANAGER_ADDRESS, field: 'strategy' })
  const equityETHValues = await api.multiCall({ abi: abis.getEquityETHValue, calls: strategies })
  const vaultLeverage = await api.multiCall({ abi: abis.getLeverage, calls: strategies })
  vaultLeverage.map((v, i) => api.addGasToken(equityETHValues[i] * v / 1e4))
}

module.exports = {
  avax: {
    tvl: avax_tvl,
  },
  terra: {
    tvl: () => ({}),
  },
  hallmarks: [[1651881600, "UST depeg"]],
};
