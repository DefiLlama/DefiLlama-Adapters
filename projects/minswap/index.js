const { getAdaInAddress } = require("../helper/chain/cardano");
const axios = require("axios");

async function tvl() {
  const res = await axios.get("https://api-mainnet-prod.minswap.org/defillama/dex-addresses")
  const poolAddresses = res.data.pools
  const orderAddresses = res.data.orders
  let liquidityPoolLocked = 0
  for (const addr of poolAddresses) {
    const adaLocked = await getAdaInAddress(addr)
    liquidityPoolLocked += adaLocked
  }
  let batchOrderLocked = 0
  for (const addr of orderAddresses) {
    const adaLocked = await getAdaInAddress(addr)
    batchOrderLocked += adaLocked
  }
  return {
    cardano: (liquidityPoolLocked * 2) + batchOrderLocked,
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  },
  hallmarks:[
    [1647949370, "Vulnerability Found"],
  ],
};
