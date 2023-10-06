const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x4Eee19e0856D23fAc3D0bDD867bEb4E1B8c78344'
const CHAIN = 'manta'

async function getFactoryLogs(api) {
  return getLogs({
    api,
    target: FACTORY,
    fromBlock: 39246,
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
  manta: { tvl, }
}
