const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

const url = {
  bsc: "https://bsc.ins3.finance/get/summary",
  heco: "https://heco.ins3.finance/get/summary",
  okexchain: "https://oec.ins3.finance/get/summary",
  conflux: "https://conflux.ins3.finance/get/summary",
  polygon: "https://polygon.ins3.finance/get/summary",
};

// tvl and staking amount
function getChainData(chain, type) {
  return async () => {
    const data = await axios.post(url[type], { type: chain });
    const info = data?.data?.data || {};
    switch (type) {
      case "tvl":
        return toUSDTBalances(info.totalPooledStaking);
      case "staking":
        return toUSDTBalances(info.totalPooledStaking);
    }
  };
}

module.exports = {
  timetravel: true,
  bsc: {
    tvl: getChainData("bsc", "tvl"),
    staking: getChainData("bsc", "staking"),
  },
  okexchain: {
    tvl: getChainData("okexchain", "tvl"),
    staking: getChainData("okexchain", "staking"),
  },
  heco: {
    tvl: getChainData("heco", "tvl"),
    staking: getChainData("heco", "staking"),
  },
  polygon: {
    tvl: getChainData("polygon", "tvl"),
    staking: getChainData("polygon", "staking"),
  },
  conflux: {
    tvl: getChainData("conflux", "tvl"),
    staking: getChainData("conflux", "staking"),
  },
  name: "ITFX Project",
};
