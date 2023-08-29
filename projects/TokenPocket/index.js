const axios = require("axios");

async function tvl() {
  const tvlData = await axios.get("https://preserver.mytokenpocket.vip/v1/pledge/global")
  return { ethereum: tvlData.data.data.data.staking_total} 
}

module.exports = {
  ethereum: {
    tvl,
  },
};
