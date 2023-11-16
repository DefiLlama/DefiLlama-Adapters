const BigNumber = require("bignumber.js");
const axios = require("axios");

const url = "https://jgvzt-eiaaa-aaaak-ae5kq-cai.raw.icp0.io/v1/rakeoff-stats";

async function tvl(_timestamp, _block) {
  try {
    const response = await axios.get(url);
    const tvl = response.data.icp_stats.total_staked;

    if (tvl === undefined) {
      throw new Error("TVL data is undefined");
    }

    return {
      "coingecko:internet-computer": BigNumber(tvl).div(1e8).toFixed(0),
    };
  } catch (error) {
    console.error("Error fetching TVL data:", error);
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts amount of ICP tokens staked on the Rakeoff dApp",
  icp: {
    tvl,
  },
};
