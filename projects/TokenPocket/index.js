const { get } = require('../helper/http')
async function tvl() {
  const tvlData = await get("https://preserver.mytokenpocket.vip/v1/pledge/global")
  return { ethereum: tvlData.data.data.staking_total} 
}

module.exports = {
  ethereum: {
    tvl,
  },
};
