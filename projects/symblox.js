const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens2 } = require("./helper/unwrapLPs");

const symblox = "0xD0CB9244844F3E11061fb3Ea136Aab3a6ACAC017";
const pools = {
  "0x2af1fea48018fe9f1266d67d45b388935df1c14d": ADDRESSES.velas.sVLX,
  "0x720b92ef8ee928c5cbe9ca787321802610bcbf6e": ADDRESSES.velas.VLX,
  "0x974d24a6bce9e0a0a27228e627c9ca1437fe0286": ADDRESSES.velas.ETH_1,
  "0xe7557efbe705e425de6a57e90447ba5ad70e9de5": ADDRESSES.velas.USDT_1,
};

async function tvl(api) {
  const ownerTokens = Object.entries(pools).map(([id, pool]) => [[pool, symblox], id])
  return sumTokens2({api, ownerTokens })
}

module.exports = {
  velas: {
    tvl,
  },
};
