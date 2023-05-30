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

async function tvl(_, _b, _cb, { api, }) {
  return sumTokens2({ api, owner: Contracts.Pool, tokens: Object.values(Contracts.Tokens) })
}

module.exports = {
  bsc: {
    tvl,
    pool2: pool2(Contracts.Chef, Contracts.LVL_BNB_LP)
  },
  hallmarks: [
    [Math.floor(new Date('2023-05-01')/1e3), 'Referral contract exploited'],
  ],
};
