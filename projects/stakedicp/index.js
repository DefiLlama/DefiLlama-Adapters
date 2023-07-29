const BigNumber = require("bignumber.js");
const axios = require('axios');

const url = 'https://h6uvl-xiaaa-aaaap-qaawa-cai.ic0.app/tvl';

async function tvl(_timestamp, _block) {
  const tvl = (await axios.get(url)).data.tvl;
  if (tvl === undefined) {
      // API didn't return a tvl number to work with
      throw new Error("Unknown");
  }
  return {
    "coingecko:internet-computer": BigNumber(tvl).div(1e8).toFixed(0),
  };
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts ICP deposited as collateral to mint stICP",
  icp: {
    tvl,
  },
};
