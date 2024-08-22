const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');

async function staking(api) {

  // API is used to get all vaults and their TVLs to avoid scan of all blockchain for matching vaults
  // also Jettons values are converted to TON using DEXs prices
  const response = await fetchURL("https://jvault.xyz/staking/stake?type=json") 
  for (const pool of response.data.pools) {
    api.add(ADDRESSES.ton.TON, pool.ton_tvl * 1e9)
  }
}


module.exports = {
  methodology: 'Counts balances of all tokens based on DEXs prices in all vaults.',
  timetravel: false,
  ton: {
    tvl: () => ({}),
    staking,
  }
}
