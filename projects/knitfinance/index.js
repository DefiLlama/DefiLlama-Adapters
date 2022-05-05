const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const url = "https://knit-admin.herokuapp.com/api/public/tvl/";

const chainConfig = {
  bsc: "bsc",
  polygon: "matic",
  ethereum: "eth",
  heco: "heco",
  fantom: "fantom",
  avalanche: "avalanche",
  kcc: "kcc",
  harmony: "harmony",
  okexchain: "okexchain",
  syscoin: "syscoin",
  telos: "telos",
  moonriver: "moonriver",
  milkomeda: "milkomeda",
  moonbeam: "moonbeam",
  bitgert: "bitgert",
  xdai: "gnosis",
  reef: "reef",
};

module.exports = {
  timetravel: false,
};

function addChain(chain) {
  module.exports[chain] = {
    tvl: async () => {
      const key = chainConfig[chain];
      let response = await get(url + key);
      return toUSDTBalances(response.data.data.tvl[key]);
    },
  };
}

Object.keys(chainConfig).map(addChain);
