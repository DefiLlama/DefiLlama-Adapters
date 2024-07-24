const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

const url = 'https://tsbvt-pyaaa-aaaar-qafva-cai.raw.icp0.io/api/metadata';

async function tvl(_timestamp, _block) {
  const metadata = (await get(url));
  const staked_icp = metadata.tracked_6m_stake + metadata.neuron_8y_stake_e8s;
  if (staked_icp === undefined) {
      // API didn't return a tvl number to work with
      throw new Error("Unknown");
  }
  return {
    "coingecko:internet-computer": BigNumber(staked_icp).div(1e8).toFixed(0),
  };
}

module.exports = {
  timetravel: false,
  methodology: 'Staked tokens are counted as TVL.',
  icp: {
    tvl,
  },
};
