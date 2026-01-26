const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');

async function fetchTvl(api) {
  const response = await fetchURL("https://settleton.finance/apiV2/vaults") 
  for (const pool of response.data) {
    api.add(ADDRESSES.ton.TON, pool.tvl * 1e9)
  }
}


module.exports = {
  methodology: `
  The methodology for calculating the total TVL is based on analyzing liquidity pool data and LP token balances. 
For each Vaults we iterate through all LP tokens and calculate their price based on following onchain data: (reserve0, reserve1, total_lp_supply)
For each pool, a calculation is performed to determine the equivalent amount of TON based on the current pool reserves and the share of LP tokens held. 
This calculation takes into account the reserve ratios and adjusts the token value to TON.
For multi-indices, the TVL of all pools is summed up, while for single indices, the value of the sole pool is used. The final TVL is represented in TON, and the index price is calculated by dividing the TVL by the total supply of the index.
  `.trim(),
  timetravel: false,
  doublecounted: true,
  ton: {
    tvl: fetchTvl
  }
}
