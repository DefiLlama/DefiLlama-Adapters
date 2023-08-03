const { getAdaInAddress } = require("../helper/chain/cardano");
const { getConfig } = require('../helper/cache')

async function tvl() {
  const res = await getConfig("minswap", "https://api-mainnet-prod.minswap.org/dex-addresses")
  const poolAddresses = res.pools
  const orderAddresses = res.orders
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
