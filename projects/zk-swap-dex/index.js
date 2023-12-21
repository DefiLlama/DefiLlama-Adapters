const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x91C94381a0F0B7F03d911676bD59d32Bb3410060'
const CHAIN = 'era'

async function getFactoryLogs(api) {
  return getLogs({
    api,
    target: FACTORY,
    fromBlock: 7891758,
    topic: 'PoolCreated(address,address,uint24,int24,address)',
    eventAbi: 'event PoolCreated(address indexed token0,address indexed token1,uint24 indexed swapFeeUnits,int24 tickDistance,address pool)',
    onlyArgs: true,
  })
}

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const factoryLogs = await getFactoryLogs(api)
  let balanceRequests = []
  factoryLogs.forEach(({ token0, token1, pool}) => {
    balanceRequests.push([token0, pool])
    balanceRequests.push([token1, pool])
  })
  return sumTokens2({ chain: CHAIN, ethBlock, tokensAndOwners: balanceRequests })
}

module.exports = {
  era: { tvl, }
}
