const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const USDCE = ADDRESSES.goat.USDC
const USDT = ADDRESSES.goat.USDT
const BTC = ADDRESSES.goat.WBTC
const GOATED = "0xbc10000000000000000000000000000000000001";

const GPLP = "0x3349BdABbC6A4185ea167EcbA379CB70d6191d9e";
const GTLP = "0x74b5348373E7C38E9e5d60F3047c1BCF4bCd00ba";
function tvl(api) {
  return sumTokens2({ api, owners: [GPLP, GTLP], tokens: [USDCE, USDT, BTC, GOATED] })
}

module.exports = {
  goat: {
    tvl,
  }
}

