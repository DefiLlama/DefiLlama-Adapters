const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.soneium.USDC
const USDTE = ADDRESSES.soneium.USDT
const ASTR = ADDRESSES.soneium.ASTAR

const SPLP = "0x368986EDcB1b2Ac55282752c6881c0E4A5A6b1bE";
const HPLP = "0x7a61A9ACe265FAc9f431F964100A80271D6a6eca";
const APLP = "0x930464D1645c06E36f41f5675Ee7E4EDcB4057b2";
function tvl(api) {
  return sumTokens2({ api, owners: [SPLP, HPLP, APLP], tokens: [USDCE, USDTE, ASTR] })
}

module.exports = {
  soneium: {
    tvl,
  }
}

