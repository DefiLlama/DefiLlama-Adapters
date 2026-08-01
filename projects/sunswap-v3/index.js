const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const { data } = await getConfig('sunswap-v3', 'https://sbc.endjgfsv.link/scan/getPoolList?version=v3')
  const ownerTokens = data.map(i => [[i.token0Address, i.token1Address], i.pairAddress])
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  tron: { tvl, },
}