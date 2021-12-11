const { toUSDT, usdtAddress } = require("../helper/balances");
const axios = require("axios");

const pfcore = "https://api.pickle.finance/prod/protocol/pfcore/";
const pickleAddress = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";

function fetch(chain, type) {
  return async (_timestamp, _ethBlock, chainBlocks) => {
    const response = (await axios.get(pfcore))?.data;

    chain = chain === "ethereum" ? "eth" : chain;

    let tvl = 0;
    let pool2 = 0;

    Object.keys(response.assets).forEach((assetsType) => {
      response.assets[assetsType].forEach((asset) => {
        if (asset.chain === chain) {
          if (asset.tags && asset.tags.includes("pool2")) {
            pool2 += asset.details.harvestStats.balanceUSD;
          } else {
            tvl += asset.details.harvestStats?.balanceUSD ?? 0;
          }
        }
      });
    });

    let result = {};

    switch (type) {
      case "tvl":
        result = { [usdtAddress]: toUSDT(tvl) };
        break;
      case "pool2":
        result = { [usdtAddress]: toUSDT(pool2) };
        break;
      case "staking":
        const picklesLocked = response.dill.pickleLocked;
        result = { [pickleAddress]: picklesLocked * 1e18 };
        break;
    }

    return result;
  };
}

module.exports = {
  ethereum: {
    tvl: fetch("ethereum", "tvl"),
    pool2: fetch("ethereum", "pool2"),
    staking: fetch("ethereum", "staking"),
  },
  polygon: {
    tvl: fetch("polygon", "tvl"),
    pool2: fetch("polygon", "pool2"),
  },
  arbitrum: {
    tvl: fetch("arbitrum", "tvl"),
    pool2: fetch("arbitrum", "pool2"),
  },
  moonriver: {
    tvl: fetch("moonriver", "tvl"),
  },
  harmony: {
    tvl: fetch("harmony", "tvl"),
  },
  okexchain: {
    tvl: fetch("okex", "tvl"),
  },
  cronos: {
    tvl: fetch("cronos", "tvl"),
  },
  aurora: {
    tvl: fetch("aurora", "tvl"),
  },
};
