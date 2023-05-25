const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const Contracts = {
  Pool: "0xd98b46C6c4D3DBc6a9Cc965F385BDDDf7a660856",
  Tokens: {
    BTC: ADDRESSES.bsc.BTCB,
    ETH: ADDRESSES.bsc.ETH,
    WBNB: ADDRESSES.bsc.WBNB,
    BUSD: ADDRESSES.bsc.BUSD,
    USDT: ADDRESSES.bsc.USDT,
  },
};

async function tvl(_, _b, _cb, { api }) {
  return sumTokens2({
    api,
    owner: Contracts.Pool,
    tokens: Object.values(Contracts.Tokens),
  });
}

module.exports = {
  bsc: {
    tvl,
  },
};
