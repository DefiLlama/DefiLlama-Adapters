const { get } = require("../helper/http");

const url = "https://jgvzt-eiaaa-aaaak-ae5kq-cai.icp0.io/v1/rakeoff-stats";

async function tvl() {
  const  { icp_stats } = await get(url)

  return {
    "coingecko:internet-computer": icp_stats.total_staked / 1e8
  }
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts amount of ICP tokens staked on the Rakeoff dApp",
  icp: {
    tvl,
  },
}
