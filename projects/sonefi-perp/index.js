const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.soneium.USDC
const USDTE = ADDRESSES.soneium.USDT

const SPLP = "0x368986EDcB1b2Ac55282752c6881c0E4A5A6b1bE";
const HPLP = "0x7a61A9ACe265FAc9f431F964100A80271D6a6eca";
function tvl(api) {
  return sumTokens2({ api, owners: [SPLP, HPLP], tokens: [USDCE, USDTE] })
}

module.exports = {
  soneium: {
    tvl,
  }
}

