const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = '0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369'
function tvl(api) {
  return sumTokens2({ api, owner: '0x368986EDcB1b2Ac55282752c6881c0E4A5A6b1bE', tokens: [USDCE] })
}

module.exports = {
  soneium: {
    tvl,
  }
}

