const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.goat.USDC
const USDT = ADDRESSES.goat.USDT
const BTC = ADDRESSES.goat.WBTC

const GPLP = "0x3349BdABbC6A4185ea167EcbA379CB70d6191d9e";
function tvl(api) {
  return sumTokens2({ api, owners: [GPLP], tokens: [USDCE, USDT, BTC] })
}

module.exports = {
  goat: {
    tvl,
  }
}

