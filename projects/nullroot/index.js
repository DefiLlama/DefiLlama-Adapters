const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Nullroot Protocol: 0xbow Privacy Pools deployment on Robinhood Chain.
// TVL = assets held by every pool registered on the Entrypoint (ETH + USDG today).
const config = {
  robinhood: { entrypoint: '0x2077Fb20b0d4746EB9BD70a7d52d36C258b0eF46', fromBlock: 104432645 },
}

const poolRegisteredEvent = 'event PoolRegistered(address pool, address asset, uint256 scope)'
const assetConfigAbi = 'function assetConfig(address) view returns (address pool, uint256 minimumDepositAmount, uint256 vettingFeeBPS, uint256 maxRelayFeeBPS)'

async function tvl(api) {
  const { entrypoint, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, eventAbi: poolRegisteredEvent, fromBlock, target: entrypoint })
  const tokensAndOwners = logs.map((log) => [log.asset, log.pool])
  const assets = [...new Set(logs.map((log) => log.asset))]
  const current = await api.multiCall({ abi: assetConfigAbi, calls: assets, target: entrypoint, field: 'pool' })
  current.forEach((pool, i) => tokensAndOwners.push([assets[i], pool]))
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'TVL is the ETH and ERC-20 balance held by every Nullroot privacy pool registered on the Entrypoint (PoolRegistered events plus the current assetConfig pool for each asset).',
  start: 1793644581,
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
