const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs2({ api, factory: '0xE5296638Aa86BD4175d802A210E158688e41A93c', eventAbi: 'event AddEntity(address indexed entity)', fromBlock: 20011312, })
  const COLLATERALS = logs.map(log => log.entity)
  const tokens = await api.multiCall({ abi: 'address:asset', calls: COLLATERALS, })
  return api.sumTokens({ tokensAndOwners2: [tokens, COLLATERALS] })
}

module.exports = {
  start: '2024-09-30',
  avax: {
    tvl,
  },
}
