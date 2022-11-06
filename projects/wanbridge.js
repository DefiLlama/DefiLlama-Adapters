const { get } = require("./helper/http");
let data

async function getAll() {
  if (!data) data = _getAll()
  return data
}

async function _getAll() {
  let cache = {};
  cache.minted = await get("https://wanscan.org/api/cc/minted");
  // cache.stake = await get("https://wanscan.org/api/cc/stake");
  // cache.timestamp = Date.now();
  return cache;
}

const chainsMap = {
  wan: "wanchain",
  ethereum: "ethereum",
  bsc: "bsc",
  avax: "avax",
  moonriver: "moonriver",
  polygon: "polygon",
  moonbeam: "moonbeam",
  okexchain: "okexchain",
  clv: "clover",
  xdc: "xdc",
}

Object.keys(chainsMap).map((chain) => {
  module.exports[chain] = {
    tvl: async () => {
      let ret = await getAll();
      let minted = ret.minted.filter((v) => v.chain == chainsMap[chain]);
      let total = 0;
      minted.map((v) => (total += v.quantity * v.price));
      return { tether: total }
    },
  };
});

module.exports.timetravel = false;
module.exports.misrepresentedTokens = true;
