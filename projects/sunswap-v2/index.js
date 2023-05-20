const { get } = require('../helper/http')

async function tvl(ts){
  const { data } = await get('https://pabc.endjgfsv.link/swapv2/scan/getAllLiquidityVolume')
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