const { fetchURL } = require("../helper/utils");

let commonTvlData = null;

async function fetchCommonTvlData() {
  if (!commonTvlData) {
    const res = await fetchURL("https://universe.staderlabs.com/common/tvl");
    commonTvlData = res.data;
  }
  return commonTvlData;
}

const createTvlFunction = (network, key) => {
  return async () => {
    const data = await fetchCommonTvlData();
    let result = { [network]: data[key].native };
    // matic is locked on ethereum network for Stader
    if (network === "ethereum") {
      result["matic-network"] = data["polygon"].native;
    }

    return result;
  };
};

module.exports = {
  timetravel: false,
  methodology:
    "We aggregated the assets staked across Stader staking protocols",
  hedera: {
    tvl: createTvlFunction("hedera-hashgraph", "hedera"),
  },
  fantom: {
    tvl: createTvlFunction("fantom", "fantom"),
  },
  terra2: {
    tvl: createTvlFunction("terra-luna-2", "terra"),
  },
  bsc: {
    tvl: createTvlFunction("binancecoin", "bnb"),
  },
  near: {
    tvl: createTvlFunction("near", "near"),
  },
  ethereum: {
    tvl: createTvlFunction("ethereum", "eth"),
  },
  hallmarks: [[1651881600, "UST depeg"]],
};
