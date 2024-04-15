const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('../notional/abi');
const { cachedGraphQuery } = require('../helper/cache')

const SUBGRAPHS = {
  arbitrum: 'https://api.studio.thegraph.com/query/36749/notional-v3-arbitrum/version/latest',
  ethereum: 'https://api.studio.thegraph.com/query/36749/notional-v3-mainnet/version/latest'
};
const vaultsQuery = `{ vaultConfigurations { id } }`

const CONTRACTS = {
  arbitrum: "0x1344A36A1B56144C3Bc62E7757377D288fDE0369",
  ethereum: "0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f"
}

async function addVaultTvl(api) {
  let { vaultConfigurations } = await cachedGraphQuery(`notional-v3/${api.chain}`, SUBGRAPHS[api.chain], vaultsQuery)
  const vaults = vaultConfigurations.map(i => i.id)
  const abi = "function getStrategyVaultInfo() view returns ((address pool, uint8 singleSidedTokenIndex, uint256 totalLPTokens, uint256 totalVaultShares, uint256 maxPoolShare, uint256 oraclePriceDeviationLimitPercent))"
  const data = await api.multiCall({ abi, calls: vaults, permitFailure: true })
  data.forEach(i => i && api.add(i.pool, i.totalLPTokens))
}

async function tvl(api) {
  let oracles = await api.fetchList({ lengthAbi: abi.getMaxCurrencyId, itemAbi: abi.getPrimeCashHoldingsOracle, target: CONTRACTS[api.chain], startFromOne: true, })
  let underlying = await api.multiCall({ abi: 'address:underlying', calls: oracles.map((o) => ({ target: o })) })
  let holdings = await api.multiCall({ abi: 'address[]:holdings', calls: oracles.map((o) => ({ target: o })) })
  let tokens = underlying.concat(holdings.flatMap((_) => _))
  await addVaultTvl(api)
  return sumTokens2({ tokens, owner: CONTRACTS[api.chain], api })
}

module.exports = {
  arbitrum: { tvl },
  ethereum: { tvl }
};