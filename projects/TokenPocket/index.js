const axios = require("axios");

async function tvl() {
  const tvlData = (
    await axios.get(
      "https://preserver.mytokenpocket.vip/v1/pledge/method_any_v2",
      {
        headers: {
          api: "/eth2/v2/partner/dashboard",
        },
      }
    )
  )
  const tvlDataOld = (
    await axios.get(
      "https://preserver.mytokenpocket.vip/v1/pledge/method_any_v1",
      {
        headers: {
          api: "/eth2/v1/global",
        },
      }
    )
  )
  const total = tvlData.data.data.staking.total_amount + tvlDataOld.data.data.data.staking_total
  // return { ethereum: tvlData.data.data.staking.total_amount} 
  return { ethereum: total} 
}

module.exports = {
  ethereum: {
    tvl,
  },
};
