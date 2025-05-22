const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");

const Contracts = {
  Pool: "0xA5aBFB56a78D2BD4689b25B8A77fd49Bb0675874",
  Chef: "0x5ae081b6647aef897dec738642089d4bda93c0e7",
  Tokens: {
    BTC: ADDRESSES.bsc.BTCB,
    ETH: ADDRESSES.bsc.ETH,
    WBNB: ADDRESSES.bsc.WBNB,
    CAKE: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    BUSD: ADDRESSES.bsc.BUSD,
    USDT: ADDRESSES.bsc.USDT
  },
  LVL_BNB_LP: "0x70f16782010fa7ddf032a6aacdeed05ac6b0bc85"
}

const ContractsArb = {
  Pool: "0x32B7bF19cb8b95C27E644183837813d4b595dcc6",
  Chef: "0x0180dee5Df18eBF76642e50FaaEF426f7b2874f7",
  Tokens: {
    ETH: ADDRESSES.arbitrum.WETH,
    USDT: ADDRESSES.arbitrum.USDT,
    USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
    BTC: ADDRESSES.arbitrum.WBTC,
    ARB: ADDRESSES.arbitrum.ARB
  }
}
async function arbtvl(api) {
  return sumTokens2({ api, owner: ContractsArb.Pool, tokens: Object.values(ContractsArb.Tokens)})
}
async function tvl(api) {
  return sumTokens2({ api, owner: Contracts.Pool, tokens: Object.values(Contracts.Tokens) })
}

module.exports = {
  bsc: {
    tvl,
    pool2: pool2(Contracts.Chef, Contracts.LVL_BNB_LP)
  },
  arbitrum: { tvl: arbtvl },
  hallmarks: [
    ['2023-05-01', 'Referral contract exploited'],
  ],
};
