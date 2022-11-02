const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const url = "https://knit-admin.herokuapp.com/api/public/tvl-weld/";

const chainConfig = {
  kava: "kava"
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
