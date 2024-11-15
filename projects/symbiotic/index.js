const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs2({ api, factory: '0x1BC8FCFbE6Aa17e4A7610F51B888f34583D202Ec', eventAbi: 'event AddEntity(address indexed entity)', fromBlock: 20011312, })
  const COLLATERALS = logs.map(log => log.entity)
  const tokens = await api.multiCall({ abi: 'address:asset', calls: COLLATERALS, })
  return api.sumTokens({ tokensAndOwners2: [tokens, COLLATERALS] })
}

module.exports = {
  start: 1718088924,
  ethereum: {
    tvl,
  },
}
