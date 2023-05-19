const { get } = require('../helper/http')

async function tvl(){
  return {
    tether: (await get('https://sbc.endjgfsv.link/ssp/getSunIOTvl')).data.allSwaps
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  tron: {
    tvl
  },
}