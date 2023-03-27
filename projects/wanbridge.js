const { get } = require("./helper/http");
let ret;
async function getTvl() {
  // This is an api which could get wanchain bridge's lockAddress, balance, tvl and price;
  // The infomation is updated every 1 hour.
  if (!ret) {
    ret = await get("https://api.wanpos.xyz/api/tvl");
  }
  return ret.data.tvl;
}

const chainsMap = {
  arbitrum: "arbitrum",
  astar: "astar",
  avax: "avalanche",
  bsc: "bsc",
  bitcoin: "btc",
  doge: "doge",
  ethereum: "ethereum",
  fantom: "fantom",
  litecoin: "ltc",
  moonbeam: "moonbeam",
  moonriver: "moonriver",
  okexchain: "okexchain",
  optimism: "optimism",
  polkadot: "polkadot",
  polygon: "polygon",
  tron: "tron",
  wan: "wanchain",
  xdc: "xdc",
  ripple: "xrp",
  // clover: "clover",
  // telos: "telos",
};

Object.keys(chainsMap).map((chain) => {
  module.exports[chain] = {
    tvl: async () => {
      let ret = await getTvl();
      return { tether: ret[chainsMap[chain]] }
    },
  };
});

module.exports.timetravel = false;
module.exports.misrepresentedTokens = true;
