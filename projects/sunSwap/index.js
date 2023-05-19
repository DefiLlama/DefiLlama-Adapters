const { get } = require('../helper/http')

async function tvl(ts){
  const { data } = await get('https://abc.endjgfsv.link/swap/scan/liquidityall')
  const lastItem = data[data.length -1]
  if (lastItem.time < (ts - 24 * 3600)) throw new Error('Outdated Data!')

  return {
    tether: lastItem.liquidity
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  tron: {
    tvl
  },
}