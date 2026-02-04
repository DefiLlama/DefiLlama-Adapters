const { sumTokens2 } = require('../helper/unwrapLPs');
const { cachedGraphQuery } = require('../helper/cache')

const CONFIG = {
  ethereum: { endpoint: '4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW', contract: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f', itemCount: 12 },
  arbitrum: { endpoint: 'DnghsCNvJ4xmp4czX8Qn7UpkJ8HyHjy7cFN4wcH91Nrx', contract: '0x1344A36A1B56144C3Bc62E7757377D288fDE0369', itemCount: 15 },
}

const payload = `{ vaultConfigurations { id } }`

const abi = {
  getMaxCurrencyId: "function getMaxCurrencyId() view returns (uint16)",
  getCurrency: "function getCurrency(uint16) view returns ((address,bool,int256,uint8,uint256),(address,bool,int256,uint8,uint256))",
  getPrimeCashHoldingsOracle: "function getPrimeCashHoldingsOracle(uint16) view returns (address)",
  currencyIdToAddress: "function currencyIdToAddress(uint16) view returns (address)"
}

async function addVaultTvl(api, endpoint) {
  const { vaultConfigurations } = await cachedGraphQuery(`notional-v3/${api.chain}`, endpoint, payload)
  const vaults = vaultConfigurations.map(i => i.id)
  const abi = "function getStrategyVaultInfo() view returns ((address pool, uint8 singleSidedTokenIndex, uint256 totalLPTokens, uint256 totalVaultShares, uint256 maxPoolShare, uint256 oraclePriceDeviationLimitPercent))"
  const data = await api.multiCall({ abi, calls: vaults, permitFailure: true })
  data.forEach(i => i && api.add(i.pool, i.totalLPTokens))
}

async function tvl(api) {
  const { endpoint, contract, itemCount } = CONFIG[api.chain]
  const tokens = await api.fetchList({ itemCount, itemAbi: abi.currencyIdToAddress, target: contract, startFromOne: true })
  await addVaultTvl(api, endpoint)
  return sumTokens2({ tokens, owner: contract, api })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})