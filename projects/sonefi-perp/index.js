const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.soneium.USDC
function tvl(api) {
  return sumTokens2({ api, owner: '0x368986EDcB1b2Ac55282752c6881c0E4A5A6b1bE', tokens: [USDCE] })
}

module.exports = {
  soneium: {
    tvl,
  }
}

