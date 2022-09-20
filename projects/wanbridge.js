const { toUSDTBalances } = require("./helper/balances");
const { get } = require("./helper/http");

let chains = {};

async function getAll() {
  let cache = {};
  cache.minted = await get("https://wanscan.org/api/cc/minted");
  cache.stake = await get("https://wanscan.org/api/cc/stake");
  cache.timestamp = Date.now();
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
};

function getChains() {
  const chains = [
    "wan",
    "ethereum",
    "bsc",
    "avax",
    "moonriver",
    "polygon",
    "moonbeam",
    "okexchain",
    "clv",
    "xdc",
  ];

  return chains;
}

getChains().map((chain) => {
  module.exports[chain] = {
    tvl: async () => {
      let ret = await getAll();
      let minted = ret.minted.filter((v) => v.chain == chainsMap[chain]);
      let total = 0;
      minted.map((v) => (total += Number(v.quantity * v.price)));
      if (chain === "wan") {
        total += Number(ret.stake);
      }
      return toUSDTBalances(total);
    },
  };
});

module.exports.timetravel = false;
