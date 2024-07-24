const { get } = require("../helper/http");

const url = 'https://tsbvt-pyaaa-aaaar-qafva-cai.raw.icp0.io/api/metadata';

async function tvl() {
  const metadata = await get(url)
  const staked_icp = metadata.tracked_6m_stake + metadata.neuron_8y_stake_e8s
  return {
    "coingecko:internet-computer": staked_icp/ 1e8
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Staked tokens are counted as TVL.',
  icp: {
    tvl,
  },
}
