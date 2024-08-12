const { sumTokensExport } = require("../helper/chain/ton");
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");
const { fetchURL } = require('../helper/utils');

async function getTvl(api) {
  const balances = {};

  // API is used to get all vaults and their TVLs to avoid scan of all blockchain for matching vaults
  // also Jettons values are converted to TON using DEXs prices
  const response = await fetchURL("https://jvault.xyz/staking/stake?type=json") 
  for (const pool of response.data.pools) {
    sdk.util.sumSingleBalance(balances, ADDRESSES.ton.TON, pool.ton_tvl * 1e9, api.chain)
  }
  return balances;
}


module.exports = {
  methodology: 'Counts balances of all tokens based on DEXs prices in all vaults.',
  timetravel: false,
  ton: {
    tvl: (api) => getTvl(api)
  }
}
