const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

const url = "https://gateway.api.01defi.com/base/fluxTvl/get";

// tvl and staking amount
function getChainData(chain, type) {
  return async () => {
    const data = await axios.get(url);
    const info = (data?.data?.data?.detail || []).find(
      (item) => item.chain === chain
    );

    switch (type) {
      case "tvl":
        return toUSDTBalances(info.lendingTVL);
      case "staking":
        return toUSDTBalances(info.stakedTVL);
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
  arbitrum: {
    tvl: getChainData("arbitrum", "tvl"),
    staking: getChainData("arbitrum", "staking"),
  },
  polygon: {
    tvl: getChainData("polygon", "tvl"),
    staking: getChainData("polygon", "staking"),
  },
  conflux: {
    tvl: getChainData("conflux", "tvl"),
    staking: getChainData("conflux", "staking"),
  },
  ethereum: {
    tvl: getChainData("ethereum", "tvl"),
    staking: getChainData("ethereum", "staking"),
  },
  name: "Flux Project",
};
