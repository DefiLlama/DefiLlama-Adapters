const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require("../helper/unwrapLPs")

const poolRegisteredEvent = "event PoolRegistered(address pool, address asset, uint256 scope)"

const config = {
  ethereum: { entrypoint: '0x6818809eefce719e480a7526d76bd3e561526b46', fromBlock: 22153713, },
  arbitrum: { entrypoint: '0x44192215FEd782896BE2CE24E0Bfbf0BF825d15E', fromBlock: 404391809, },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl
  }
})

async function tvl(api) {
  const { entrypoint, fromBlock } = config[api.chain]
  const logs = await getLogs2({ api, eventAbi: poolRegisteredEvent, fromBlock, target: entrypoint, })
  const tokensAndOwners = logs.map(log => [log.asset, log.pool])

  const tokens = logs.map(log => log.asset)
  const poolConfig = await api.multiCall({ abi: 'function assetConfig(address) view returns ( address pool,  uint256 minimumDepositAmount,  uint256 vettingFeeBPS, uint256 maxRelayFeeBPS )', calls: tokens, target: entrypoint, field: 'pool' })
  poolConfig.forEach((config, idx) => {
    tokensAndOwners.push([tokens[idx], config])
  })

  return sumTokens2({ api, tokensAndOwners })
}