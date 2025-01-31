const { get } = require("../helper/http");

const url = 'https://h6uvl-xiaaa-aaaap-qaawa-cai.raw.ic0.app/tvl';

async function tvl(_timestamp, _block) {
  const tvl = (await get(url)).tvl;
  if (tvl === undefined) {
      // API didn't return a tvl number to work with
      throw new Error("Unknown");
  }
  return {
    "coingecko:internet-computer": tvl/1e8,
  };
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts ICP deposited as collateral to mint stICP",
  icp: {
    tvl,
  },
};
