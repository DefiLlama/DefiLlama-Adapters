const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.sseed.USDC
const OUSDT = ADDRESSES.sseed.oUSDT

const SPLP = "0x6B1fcc8eCb7832E720D5ed13fb4F4c249F88b833";
function tvl(api) {
  return sumTokens2({ api, owners: [SPLP], tokens: [USDCE, OUSDT] })
}

module.exports = {
  sseed: {
    tvl,
  }
}

