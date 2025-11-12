const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.goat.USDC
const USDT = ADDRESSES.goat.USDT
const BTC = ADDRESSES.goat.WBTC
const GOATED = "0xbc10000000000000000000000000000000000001";

const GPLP = "0x3349BdABbC6A4185ea167EcbA379CB70d6191d9e";
const GTLP = "0xDcA962441F19c70d1aFF25ab726b30895d8C45Bd";
function tvl(api) {
  return sumTokens2({ api, owners: [GPLP, GTLP], tokens: [USDCE, USDT, BTC, GOATED] })
}

module.exports = {
  goat: {
    tvl,
  }
}

