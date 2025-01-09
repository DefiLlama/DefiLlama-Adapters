const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x23c088198347edb873946fcff77e42401a1a93d2',
    eventAbi: 'event LOG_NEW_POOL(address indexed caller, address indexed pool)',
    onlyArgs: true,
    fromBlock: 12028810,
  })
  const pools = logs.map(l => l.pool)
  const tokens = await api.multiCall({  abi: 'address[]:getFinalTokens', calls: pools})
  return api.sumTokens({ ownerTokens: pools.map((v, i) => [tokens[i], v])})
}

module.exports = {
  ethereum: {
    tvl
  },
}
