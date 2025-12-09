const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require("../helper/unwrapLPs")

const poolRegisteredEvent = "event PoolRegistered(address pool, address asset, uint256 scope)"

const config = {
  ethereum: { entrypoint: '0x6818809eefce719e480a7526d76bd3e561526b46', fromBlock: 22153713, },
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
  return sumTokens2({ api, tokensAndOwners })
}