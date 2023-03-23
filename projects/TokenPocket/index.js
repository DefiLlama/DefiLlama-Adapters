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
  let total_amount = 0
  if (tvlData?.data?.data?.staking) {
    total_amount = tvlData?.data?.data?.staking.total_amount || 0
  }
  return { ethereum: total_amount} 
}

module.exports = {
  ethereum: {
    tvl,
  },
};
