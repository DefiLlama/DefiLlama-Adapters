const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

const url = 'https://tsbvt-pyaaa-aaaar-qafva-cai.raw.ic0.app/api/metadata';

async function tvl(_timestamp, _block) {
  const tvl = (await get(url)).tvl;
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
  methodology: "Liquid staking for Internet Computer Protocol.",
  methodology: 'Staked tokens are counted as TVL.',
  icp: {
    tvl,
  },
};
