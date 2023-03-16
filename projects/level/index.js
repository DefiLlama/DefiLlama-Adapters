const { sumTokens2 } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");

const Contracts = {
  Pool: "0xA5aBFB56a78D2BD4689b25B8A77fd49Bb0675874",
  Chef: "0x5ae081b6647aef897dec738642089d4bda93c0e7",
  Tokens: {
    BTC: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    CAKE: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    USDT: "0x55d398326f99059fF775485246999027B3197955"
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
};
